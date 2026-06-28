import NewsletterSubscription from '../models/NewsletterSubscription.js';
import NewsletterCampaign from '../models/NewsletterCampaign.js';
import { sendEmail } from '../utils/sendEmail.js';

// @desc    Subscribe to newsletter
// @route   POST /api/newsletter/subscribe
export const subscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    const subscriber = await NewsletterSubscription.findOne({ email });

    if (subscriber) {
      if (subscriber.active) {
        return res.status(200).json({ message: 'You are already subscribed to our newsletter!' });
      } else {
        subscriber.active = true;
        subscriber.subscribedAt = new Date();
        await subscriber.save();
        return res.status(200).json({ message: 'Thank you for re-subscribing to our newsletter!' });
      }
    }

    await NewsletterSubscription.create({ email });
    res.status(201).json({ message: 'Thank you for subscribing to our newsletter!' });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Get all subscribers (Admin)
// @route   GET /api/newsletter/subscribers
export const getSubscribers = async (req, res) => {
  try {
    const subscribers = await NewsletterSubscription.find().sort({ subscribedAt: -1 });
    res.json(subscribers);
  } catch (error) {
    console.error('Get subscribers error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Unsubscribe from newsletter
// @route   POST /api/newsletter/unsubscribe
export const unsubscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const subscriber = await NewsletterSubscription.findOne({ email });
    if (!subscriber) {
      return res.status(404).json({ error: 'Subscriber email not found' });
    }

    subscriber.active = false;
    await subscriber.save();
    res.json({ message: 'You have unsubscribed successfully.' });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Send a manual newsletter campaign (Admin)
// @route   POST /api/newsletter/campaign
export const sendManualCampaign = async (req, res) => {
  try {
    const { subject, body } = req.body;
    if (!subject || !body) {
      return res.status(400).json({ error: 'Subject and body are required' });
    }

    // Get active subscribers
    const activeSubscribers = await NewsletterSubscription.find({ active: true });
    const count = activeSubscribers.length;

    // Save campaign details
    const campaign = await NewsletterCampaign.create({
      subject,
      body,
      recipientsCount: count,
      triggerType: 'manual',
    });

    const emailTemplateHtml = (content) => `<div style="font-family: 'DM Sans', sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #eee; border-radius: 12px; background: #fff; color: #111;">
      <h2 style="font-family: 'Bebas Neue', sans-serif; font-size: 26px; color: #000; letter-spacing: 1.5px; margin: 0 0 10px 0; text-transform: uppercase;">GenZ Skin Studio</h2>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 15px 0 25px 0;" />
      <p style="font-size: 15px; color: #333; line-height: 1.7; white-space: pre-wrap; font-weight: 300; margin: 0 0 25px 0;">${content}</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 25px 0 15px 0;" />
      <p style="font-size: 11px; color: #aaa; text-align: center; margin: 0;">You are receiving this email because you subscribed to our newsletter at GenZ Skin Studio.</p>
    </div>`;

    let previewUrl = null;
    const isEthereal = !process.env.EMAIL_USER || !process.env.EMAIL_PASS;

    if (isEthereal && activeSubscribers.length > 0) {
      // For local testing (Ethereal), send the first email synchronously to return a preview URL to the admin panel
      try {
        const firstEmailRes = await sendEmail({
          to: activeSubscribers[0].email,
          subject,
          text: body,
          html: emailTemplateHtml(body),
        });
        if (firstEmailRes && firstEmailRes.previewUrl) {
          previewUrl = firstEmailRes.previewUrl;
        }
      } catch (err) {
        console.error('Ethereal first email send failed:', err);
      }

      // Broadcast to the rest of the subscribers in batches of 5 concurrent connections
      const remainingSubscribers = activeSubscribers.slice(1);
      const batchSize = 5;
      for (let i = 0; i < remainingSubscribers.length; i += batchSize) {
        const batch = remainingSubscribers.slice(i, i + batchSize);
        await Promise.all(batch.map(async (subscriber) => {
          try {
            await sendEmail({
              to: subscriber.email,
              subject,
              text: body,
              html: emailTemplateHtml(body),
            });
          } catch (err) {
            console.error(`Failed to send campaign email to ${subscriber.email}:`, err);
          }
        }));
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    } else {
      // In production (real SMTP), run the entire broadcast in batches of 5 concurrent connections
      const batchSize = 5;
      for (let i = 0; i < activeSubscribers.length; i += batchSize) {
        const batch = activeSubscribers.slice(i, i + batchSize);
        await Promise.all(batch.map(async (subscriber) => {
          try {
            await sendEmail({
              to: subscriber.email,
              subject,
              text: body,
              html: emailTemplateHtml(body),
            });
          } catch (err) {
            console.error(`Failed to send campaign email to ${subscriber.email}:`, err);
          }
        }));
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    res.status(201).json({
      message: `Campaign broadcast started for ${count} subscribers!${previewUrl ? ' (Ethereal test mode active)' : ''}`,
      campaign,
      previewUrl,
    });
  } catch (error) {
    console.error('Send campaign error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Get sent campaigns history (Admin)
// @route   GET /api/newsletter/campaigns
export const getCampaigns = async (req, res) => {
  try {
    const campaigns = await NewsletterCampaign.find()
      .populate('productRef', 'name price image')
      .sort({ sentAt: -1 });
    res.json(campaigns);
  } catch (error) {
    console.error('Get campaigns error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Helper function to trigger automated product release campaign
export const sendProductReleaseCampaign = async (product) => {
  try {
    const activeSubscribers = await NewsletterSubscription.find({ active: true });
    const count = activeSubscribers.length;

    const subject = `New Arrival Drop: ${product.name}!`;
    const body = `Hey Glow Squad! We just dropped our new skincare essential: ${product.name}. Check it out for PKR ${product.price.toLocaleString()}!\nDescription: ${product.description}`;

    const campaign = await NewsletterCampaign.create({
      subject,
      body,
      recipientsCount: count,
      triggerType: 'new_arrival',
      productRef: product._id,
    });

    const baseUrl = (process.env.FRONTEND_URL || 'https://genzskinstudio.com').replace('genzskinstudio.vercel.app', 'genzskinstudio.com');
    // Broadcast automated product release emails to subscribers in batches of 5 concurrent requests
    const batchSize = 5;
    for (let i = 0; i < activeSubscribers.length; i += batchSize) {
      const batch = activeSubscribers.slice(i, i + batchSize);
      await Promise.all(batch.map(async (subscriber) => {
        try {
          await sendEmail({
            to: subscriber.email,
            subject,
            text: body,
            html: `<div style="font-family: 'DM Sans', sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #eee; border-radius: 12px; background: #fff; color: #111;">
              <h2 style="font-family: 'Bebas Neue', sans-serif; font-size: 26px; color: #000; letter-spacing: 1.5px; margin: 0 0 5px 0; text-transform: uppercase;">GenZ Skin Studio</h2>
              <span style="font-size: 10px; letter-spacing: 0.15em; color: #d4608a; text-transform: uppercase; font-weight: 700;">New Arrival Drop</span>
              <hr style="border: 0; border-top: 1px solid #eee; margin: 15px 0 25px 0;" />
              <h3 style="font-size: 19px; color: #000; margin: 0 0 10px 0;">✨ ${product.name}</h3>
              <p style="font-size: 20px; font-weight: bold; color: #000; margin: 0 0 15px 0;">PKR ${product.price.toLocaleString()}</p>
              <p style="font-size: 14px; color: #555; line-height: 1.6; margin: 0 0 25px 0; font-weight: 300;">${product.description}</p>
              <div style="text-align: center; margin-bottom: 25px;">
                <a href="${baseUrl}/product/${product._id}" style="background: #000; color: #fff; text-decoration: none; padding: 12px 30px; border-radius: 30px; font-weight: 700; display: inline-block; font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; transition: background 0.2s;">View Product</a>
              </div>
              <hr style="border: 0; border-top: 1px solid #eee; margin: 25px 0 15px 0;" />
              <p style="font-size: 11px; color: #aaa; text-align: center; margin: 0;">You are receiving this email because you subscribed to our newsletter at GenZ Skin Studio.</p>
            </div>`,
          });
        } catch (err) {
          console.error(`Failed to send automated campaign email to ${subscriber.email}:`, err);
        }
      }));
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    return campaign;
  } catch (error) {
    console.error('Failed to trigger product release campaign:', error);
  }
};

// @desc    Delete subscriber completely (Admin)
// @route   DELETE /api/newsletter/subscribers/:id
export const deleteSubscriber = async (req, res) => {
  try {
    const subscriber = await NewsletterSubscription.findById(req.params.id);
    if (!subscriber) {
      return res.status(404).json({ error: 'Subscriber not found' });
    }
    await subscriber.deleteOne();
    res.json({ message: 'Subscriber deleted successfully' });
  } catch (error) {
    console.error('Delete subscriber error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Delete campaign history entry completely (Admin)
// @route   DELETE /api/newsletter/campaigns/:id
export const deleteCampaign = async (req, res) => {
  try {
    const campaign = await NewsletterCampaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    await campaign.deleteOne();
    res.json({ message: 'Campaign history entry deleted successfully' });
  } catch (error) {
    console.error('Delete campaign error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
