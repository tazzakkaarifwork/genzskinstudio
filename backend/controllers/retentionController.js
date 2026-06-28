import Order from '../models/Order.js';
import User from '../models/User.js';
import RetentionSettings from '../models/RetentionSettings.js';
import RetentionReminder from '../models/RetentionReminder.js';
import { sendEmail } from '../utils/sendEmail.js';

// Get default or existing retention settings
const getOrInitSettings = async () => {
  let settings = await RetentionSettings.findOne();
  if (!settings) {
    settings = await RetentionSettings.create({});
  }
  // Initialize new schema values from legacy inactivityDays field
  if (settings.inactivityValue === undefined) {
    settings.inactivityValue = settings.inactivityDays || 30;
    settings.inactivityUnit = 'days';
    await settings.save();
  }
  return settings;
};

export const getInactiveCustomers = async (req, res) => {
  try {
    const settings = await getOrInitSettings();

    const inactivityValue = settings.inactivityValue || 30;
    const inactivityUnit = settings.inactivityUnit || 'days';

    const inactivityLimitDate = new Date();

    if (inactivityUnit === 'minutes') {
      inactivityLimitDate.setMinutes(
        inactivityLimitDate.getMinutes() - inactivityValue
      );
    } else {
      inactivityLimitDate.setDate(
        inactivityLimitDate.getDate() - inactivityValue
      );
    }

    const inactiveAgg = await Order.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$contact.email',
          lastOrderDate: { $first: '$createdAt' },
          totalSpent: { $sum: '$totalPrice' },
          orderCount: { $sum: 1 },
          firstName: { $first: '$shippingDetails.firstName' },
          lastName: { $first: '$shippingDetails.lastName' },
          phone: { $first: '$shippingDetails.phone' },
          userRef: { $first: '$user' },
          lastOrderId: { $first: '$_id' },
        },
      },
      {
        $match: {
          lastOrderDate: { $lt: inactivityLimitDate },
        },
      },
      { $sort: { lastOrderDate: 1 } },
    ]);

    const inactiveCustomers = await Promise.all(
      inactiveAgg.map(async (customer) => {
        const latestReminder = await RetentionReminder.findOne({
          email: customer._id,
        }).sort({ sentAt: -1 });

        const diffMs = new Date() - new Date(customer.lastOrderDate);

        const daysInactive = Math.floor(
          diffMs / (1000 * 60 * 60 * 24)
        );

        const minutesInactive = Math.floor(diffMs / (1000 * 60));

        return {
          email: customer._id,
          name:
            `${customer.firstName || ''} ${
              customer.lastName || ''
            }`.trim() || 'Guest Customer',
          lastOrderDate: customer.lastOrderDate,
          lastOrderId: customer.lastOrderId,
          totalSpent: customer.totalSpent,
          orderCount: customer.orderCount,
          phone: customer.phone,
          daysInactive,
          minutesInactive,
          inactivityText:
            inactivityUnit === 'minutes'
              ? `${minutesInactive} Mins`
              : `${daysInactive} Days`,
          latestReminder: latestReminder
            ? {
                sentAt: latestReminder.sentAt,
                couponCode: latestReminder.couponCode,
                status: latestReminder.status,
              }
            : null,
        };
      })
    );

    res.json({
      settings,
      inactiveCustomers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Send retention reminder manually (Admin)
// @route   POST /api/retention/remind
export const sendRetentionReminder = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Customer email is required',
      });
    }

    const settings = await getOrInitSettings();

    const lastOrder = await Order.findOne({
      'contact.email': email,
    }).sort({ createdAt: -1 });

    if (!lastOrder) {
      return res.status(404).json({
        error: 'No orders found for this email',
      });
    }

    const diffMs = new Date() - new Date(lastOrder.createdAt);

    const daysInactive = Math.floor(
      diffMs / (1000 * 60 * 60 * 24)
    );

    const minutesInactive = Math.floor(diffMs / (1000 * 60));

    // ✅ TIMER MODE CHECK (NEW FEATURE)
    if (settings.timerModeEnabled) {
      const reached =
        settings.inactivityUnit === 'minutes'
          ? minutesInactive >= settings.inactivityValue
          : daysInactive >= settings.inactivityValue;

      if (!reached) {
        return res.status(400).json({
          error: `Not eligible yet. Inactive for ${
            settings.inactivityUnit === 'minutes'
              ? minutesInactive + ' minutes'
              : daysInactive + ' days'
          }`,
        });
      }
    }

    const reminder = await RetentionReminder.create({
      email,
      daysInactive:
        settings.inactivityUnit === 'minutes'
          ? minutesInactive
          : daysInactive,
      couponCode: settings.couponCode,
      status: 'sent',
    });

    const registeredUser = await User.findOne({ email });

    if (registeredUser) {
      registeredUser.lastReminderSentAt = new Date();
      registeredUser.inactivityReminderCount =
        (registeredUser.inactivityReminderCount || 0) + 1;
      await registeredUser.save();
    }

    const customerName =
      `${lastOrder.shippingDetails.firstName || ''} ${
        lastOrder.shippingDetails.lastName || 'Customer'
      }`.trim();

    let template =
      settings.emailTemplate ||
      'Hey {{name}}, we miss you! Use code {{code}} for {{discount}}% off your next purchase.';

    template = template.replace('{{name}}', customerName);
    template = template.replace('{{code}}', settings.couponCode);
    template = template.replace(
      '{{discount}}',
      settings.discountPercent.toString()
    );

    await sendEmail({
      to: email,
      subject: 'We Miss You!',
      text: template,
      html: `<p>${template}</p>`,
    });

    res.status(201).json({
      message: 'Reminder sent successfully',
      reminder,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Send retention reminders to all inactive customers at once (Admin)
// @route   POST /api/retention/remind-all
export const sendAllRetentionReminders = async (req, res) => {
  try {
    const settings = await getOrInitSettings();

    const inactivityValue = settings.inactivityValue || 30;
    const inactivityUnit = settings.inactivityUnit || 'days';

    const inactivityLimitDate = new Date();

    if (inactivityUnit === 'minutes') {
      inactivityLimitDate.setMinutes(
        inactivityLimitDate.getMinutes() - inactivityValue
      );
    } else {
      inactivityLimitDate.setDate(
        inactivityLimitDate.getDate() - inactivityValue
      );
    }

    const inactiveAgg = await Order.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$contact.email',
          lastOrderDate: { $first: '$createdAt' },
          totalSpent: { $sum: '$totalPrice' },
          orderCount: { $sum: 1 },
          firstName: { $first: '$shippingDetails.firstName' },
          lastName: { $first: '$shippingDetails.lastName' },
          phone: { $first: '$shippingDetails.phone' },
          userRef: { $first: '$user' },
          lastOrderId: { $first: '$_id' },
        },
      },
      {
        $match: {
          lastOrderDate: { $lt: inactivityLimitDate },
        },
      },
    ]);

    if (inactiveAgg.length === 0) {
      return res.status(400).json({
        error: 'No inactive customers found to remind',
      });
    }

    let sentCount = 0;
    for (const customer of inactiveAgg) {
      const email = customer._id;
      const diffMs = new Date() - new Date(customer.lastOrderDate);
      const daysInactive = Math.floor(
        diffMs / (1000 * 60 * 60 * 24)
      );
      const minutesInactive = Math.floor(diffMs / (1000 * 60));

      // Recheck latest reminder timer limit if enabled
      if (settings.timerModeEnabled) {
        const reached =
          settings.inactivityUnit === 'minutes'
            ? minutesInactive >= settings.inactivityValue
            : daysInactive >= settings.inactivityValue;

        if (!reached) continue;
      }

      await RetentionReminder.create({
        email,
        daysInactive:
          settings.inactivityUnit === 'minutes'
            ? minutesInactive
            : daysInactive,
        couponCode: settings.couponCode,
        status: 'sent',
      });

      const registeredUser = await User.findOne({ email });
      if (registeredUser) {
        registeredUser.lastReminderSentAt = new Date();
        registeredUser.inactivityReminderCount =
          (registeredUser.inactivityReminderCount || 0) + 1;
        await registeredUser.save();
      }

      const customerName =
        `${customer.firstName || ''} ${
          customer.lastName || 'Customer'
        }`.trim();

      let template =
        settings.emailTemplate ||
        'Hey {{name}}, we miss you! Use code {{code}} for {{discount}}% off your next purchase.';

      template = template.replace('{{name}}', customerName);
      template = template.replace('{{code}}', settings.couponCode);
      template = template.replace(
        '{{discount}}',
        settings.discountPercent.toString()
      );

      try {
        await sendEmail({
          to: email,
          subject: 'We Miss You!',
          text: template,
          html: `<p>${template}</p>`,
        });
        sentCount++;
      } catch (err) {
        console.error(`Failed to send retention email to ${email}:`, err);
      }
    }

    res.status(200).json({
      message: `Retention promo reminders dispatched successfully to ${sentCount} inactive customers!`,
      sentCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};


// @desc    Get retention settings
// @route   GET /api/retention/settings
export const getRetentionSettings = async (req, res) => {
  try {
    const settings = await getOrInitSettings();
    res.json(settings);
  } catch (error) {
    console.error('Get retention settings error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
export const updateRetentionSettings = async (req, res) => {
  try {
    const {
      autoReminderEnabled,
      inactivityDays,
      inactivityValue,
      inactivityUnit,
      timerModeEnabled,
      couponCode,
      discountPercent,
      emailTemplate,
    } = req.body;

    const settings = await getOrInitSettings();

    if (autoReminderEnabled !== undefined)
      settings.autoReminderEnabled = autoReminderEnabled;

    if (inactivityDays !== undefined)
      settings.inactivityDays = inactivityDays;

    if (inactivityValue !== undefined)
      settings.inactivityValue = inactivityValue;

    if (inactivityUnit !== undefined)
      settings.inactivityUnit = inactivityUnit;

    if (timerModeEnabled !== undefined)
      settings.timerModeEnabled = timerModeEnabled;

    if (couponCode !== undefined)
      settings.couponCode = couponCode;

    if (discountPercent !== undefined)
      settings.discountPercent = discountPercent;

    if (emailTemplate !== undefined)
      settings.emailTemplate = emailTemplate;

    if (settings.inactivityUnit === 'days') {
      settings.inactivityDays = settings.inactivityValue;
    }

    await settings.save();

    res.json({
      message: 'Settings updated successfully',
      settings,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Get retention reminders log history (Admin)
// @route   GET /api/retention/logs
export const getReminderLogs = async (req, res) => {
  try {
    const logs = await RetentionReminder.find().sort({ sentAt: -1 });
    res.json(logs);
  } catch (error) {
    console.error('Get reminder logs error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Get all promo codes
// @route   GET /api/retention/promo-codes
export const getPromoCodes = async (req, res) => {
  try {
    const settings = await getOrInitSettings();
    res.json(settings.promoCodes || []);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Add a new promo code
// @route   POST /api/retention/promo-codes
export const addPromoCode = async (req, res) => {
  try {
    const { code, discountPercent, label } = req.body;
    if (!code || !discountPercent) {
      return res.status(400).json({ error: 'Code and discount percent are required' });
    }
    const settings = await getOrInitSettings();
    
    // Check duplicate
    const upperCode = code.trim().toUpperCase();
    const exists = (settings.promoCodes || []).some(p => p.code.toUpperCase() === upperCode);
    if (exists) {
      return res.status(400).json({ error: 'This promo code already exists' });
    }
    
    settings.promoCodes.push({
      code: upperCode,
      discountPercent: Number(discountPercent),
      label: label || '',
    });
    await settings.save();
    res.status(201).json(settings.promoCodes);
  } catch (error) {
    console.error('Add promo code error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Delete a promo code by its _id
// @route   DELETE /api/retention/promo-codes/:id
export const deletePromoCode = async (req, res) => {
  try {
    const { id } = req.params;
    const settings = await getOrInitSettings();
    
    const idx = (settings.promoCodes || []).findIndex(p => p._id.toString() === id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Promo code not found' });
    }
    
    settings.promoCodes.splice(idx, 1);
    await settings.save();
    res.json(settings.promoCodes);
  } catch (error) {
    console.error('Delete promo code error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
