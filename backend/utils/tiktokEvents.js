// TikTok Server-Side Events API
// Yeh backend se directly TikTok ko order data bhejta hai
// iOS aur ad blockers is ko block NAHI kar sakte

import crypto from 'crypto';

const TIKTOK_PIXEL_ID = 'D8T233JC77U23I02G9F0';
const TIKTOK_ACCESS_TOKEN = process.env.TIKTOK_ACCESS_TOKEN || '';
const TIKTOK_API_URL = 'https://business-api.tiktok.com/open_api/v1.3/event/track/';

/**
 * Hash karta hai email/phone TikTok ke liye (SHA-256)
 */
const hashData = (value) => {
  if (!value) return undefined;
  return crypto.createHash('sha256').update(value.trim().toLowerCase()).digest('hex');
};

/**
 * TikTok ko server-side Purchase event bhejta hai
 * @param {Object} order - Database se aaya order object
 */
export const sendTikTokPurchaseEvent = async (order) => {
  if (!TIKTOK_ACCESS_TOKEN) {
    console.warn('TikTok Access Token not set — skipping server-side event');
    return;
  }

  try {
    const eventTime = Math.floor(Date.now() / 1000);

    // Order items TikTok format mein
    const contents = (order.orderItems || []).map(item => ({
      content_id: item.product?.toString() || '',
      content_name: item.name || '',
      quantity: item.quantity || 1,
      price: item.price || 0,
    }));

    const totalQuantity = contents.reduce((sum, i) => sum + i.quantity, 0);

    const payload = {
      pixel_code: TIKTOK_PIXEL_ID,
      event: 'Purchase',
      event_id: order._id?.toString(), // Duplicate events rokne ke liye unique ID
      timestamp: new Date(eventTime * 1000).toISOString(),
      context: {
        user: {
          email: hashData(order.contact?.email),
          phone_number: hashData(order.shippingDetails?.phone),
        },
        page: {
          url: 'https://www.genzskinstudio.com/order-success',
          referrer: 'https://www.genzskinstudio.com/checkout',
        },
      },
      properties: {
        contents,
        content_type: 'product',
        currency: 'PKR',
        value: order.totalPrice || 0,
        quantity: totalQuantity,
        order_id: order._id?.toString(),
      },
    };

    const response = await fetch(TIKTOK_API_URL, {
      method: 'POST',
      headers: {
        'Access-Token': TIKTOK_ACCESS_TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (result.code === 0) {
      console.log(`✅ TikTok Server Event sent for order ${order._id}`);
    } else {
      console.warn(`⚠️ TikTok Server Event failed for order ${order._id}:`, result.message);
    }
  } catch (err) {
    // Non-blocking — order save hoga, sirf event fail hoga
    console.error('TikTok server event error:', err.message);
  }
};
