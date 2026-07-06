// Facebook (Meta) Conversions API (Server-Side Events)
// Directly transmits order data to Facebook to bypass ad blockers/iOS restrictions
import crypto from 'crypto';

const FACEBOOK_PIXEL_ID = process.env.FACEBOOK_PIXEL_ID || '995660940118009';
const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN || process.env.META_ACCESS_TOKEN || '';
const FACEBOOK_API_URL = `https://graph.facebook.com/v19.0/${FACEBOOK_PIXEL_ID}/events`;

/**
 * Hash data for Meta Pixel (SHA-256)
 */
const hashData = (value) => {
  if (!value) return undefined;
  return crypto.createHash('sha256').update(value.trim().toLowerCase()).digest('hex');
};

/**
 * Hash phone number specifically following Meta norms (numbers only, e.g. 923001234567)
 */
const hashPhone = (value) => {
  if (!value) return undefined;
  const digitsOnly = value.replace(/\D/g, '');
  return crypto.createHash('sha256').update(digitsOnly).digest('hex');
};

/**
 * Sends a server-side Purchase event to Meta Conversions API
 * @param {Object} order - Order object containing details
 */
export const sendFacebookPurchaseEvent = async (order) => {
  if (!FACEBOOK_ACCESS_TOKEN) {
    console.warn('Facebook Access Token not set — skipping Conversions API server-side event');
    return;
  }

  try {
    const eventTime = Math.floor(Date.now() / 1000);

    const contents = (order.orderItems || []).map(item => ({
      id: item.product?.toString() || '',
      quantity: item.quantity || 1,
      item_price: item.price || 0,
    }));

    const payload = {
      data: [
        {
          event_name: 'Purchase',
          event_time: eventTime,
          event_id: order._id?.toString(), // Unique event ID matching browser pixel for deduplication
          event_source_url: 'https://www.genzskinstudio.com/order-success',
          action_source: 'website',
          user_data: {
            em: order.contact?.email ? [hashData(order.contact.email)] : [],
            ph: order.shippingDetails?.phone ? [hashPhone(order.shippingDetails.phone)] : [],
          },
          custom_data: {
            currency: 'PKR',
            value: order.totalPrice || 0,
            content_type: 'product',
            contents: contents,
          },
        }
      ]
    };

    const response = await fetch(`${FACEBOOK_API_URL}?access_token=${FACEBOOK_ACCESS_TOKEN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (result.fbtrace_id || result.events_received) {
      console.log(`✅ Facebook CAPI Purchase event sent for order ${order._id}`);
    } else {
      console.warn(`⚠️ Facebook CAPI Purchase event failed for order ${order._id}:`, result.error?.message || result);
    }
  } catch (err) {
    console.error('Facebook CAPI server event error:', err.message);
  }
};
