import { sendEmail } from './sendEmail.js';

/**
 * Sends a premium styled HTML order confirmation/invoice email to the customer.
 * @param {Object} order - The populated Order document from MongoDB.
 */
export const sendOrderInvoiceEmail = async (order) => {
  try {
    const { contact, shippingDetails, orderItems, totalPrice, _id, createdAt, paymentMethod } = order;
    
    const orderIdStr = _id.toString().toUpperCase();
    const baseUrl = (process.env.FRONTEND_URL || 'https://genzskinstudio.com').replace('genzskinstudio.vercel.app', 'genzskinstudio.com');
    const dateStr = new Date(createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const customerName = `${shippingDetails.firstName || ''} ${shippingDetails.lastName}`.trim();

    // Map ordered items to HTML rows
    const itemRows = orderItems.map(item => `
      <tr style="border-bottom: 1px solid #f0f0f0;">
        <td style="padding: 15px 0; text-align: left; vertical-align: middle;">
          <span style="font-size: 14px; font-weight: 600; color: #1a1a1a; display: block; margin-bottom: 2px;">${item.name}</span>
          <span style="font-size: 11px; color: #7a7a7a; text-transform: uppercase; letter-spacing: 0.5px;">Qty: ${item.quantity} &times; PKR ${item.price.toLocaleString()}</span>
        </td>
        <td style="padding: 15px 0; text-align: right; vertical-align: middle; font-size: 14px; font-weight: 700; color: #1a1a1a;">
          PKR ${(item.price * item.quantity).toLocaleString()}
        </td>
      </tr>
    `).join('');

    const formattedPaymentMethod = paymentMethod === 'cash_on_delivery' 
      ? 'Cash on Delivery (COD)' 
      : paymentMethod.replace(/_/g, ' ').toUpperCase();

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Confirmation #${orderIdStr}</title>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
      </head>
      <body style="margin: 0; padding: 0; background-color: #f7f7f7; font-family: 'DM Sans', Arial, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f7f7f7; padding: 40px 10px;">
          <tr>
            <td align="center">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03); border: 1px solid #eaeaea;">
                
                <!-- HEADER -->
                <tr>
                  <td align="center" style="background-color: #000000; padding: 35px 40px; color: #ffffff;">
                    <h2 style="font-size: 26px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; margin: 0; color: #ffffff; font-family: 'DM Sans', Arial, sans-serif;">GenZ Skin Studio</h2>
                    <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #cda250; font-weight: 700; margin: 8px 0 0 0;">Order Confirmed & Invoice</p>
                  </td>
                </tr>

                <!-- INTRO -->
                <tr>
                  <td style="padding: 40px 40px 20px 40px;">
                    <h1 style="font-size: 20px; font-weight: 700; color: #1a1a1a; margin: 0 0 10px 0;">Thank you for your order, ${customerName}!</h1>
                    <p style="font-size: 14px; line-height: 1.6; color: #555555; margin: 0; font-weight: 300;">We've received your order and are getting it ready for shipment. Below you will find your invoice details. We'll send you another email as soon as your package drops!</p>
                  </td>
                </tr>

                <!-- ORDER METADATA -->
                <tr>
                  <td style="padding: 0 40px 20px 40px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f9f9f9; border-radius: 12px; padding: 20px; border: 1px dashed #e0e0e0;">
                      <tr>
                        <td>
                          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 13px;">
                            <tr>
                              <td style="padding: 4px 0; color: #7a7a7a; font-weight: 500;">Invoice/Order ID</td>
                              <td style="padding: 4px 0; text-align: right; font-weight: 700; color: #1a1a1a;">#${orderIdStr}</td>
                            </tr>
                            <tr>
                              <td style="padding: 4px 0; color: #7a7a7a; font-weight: 500;">Date</td>
                              <td style="padding: 4px 0; text-align: right; color: #1a1a1a;">${dateStr}</td>
                            </tr>
                            <tr>
                              <td style="padding: 4px 0; color: #7a7a7a; font-weight: 500;">Payment Method</td>
                              <td style="padding: 4px 0; text-align: right; color: #1a1a1a;">${formattedPaymentMethod}</td>
                            </tr>
                            <tr>
                              <td style="padding: 4px 0; color: #7a7a7a; font-weight: 500;">Order Status</td>
                              <td style="padding: 4px 0; text-align: right; color: #d48e00; font-weight: 700; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px;">Pending Verification</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- SHIPPING DETAILS -->
                <tr>
                  <td style="padding: 0 40px 20px 40px;">
                    <h3 style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #7a7a7a; border-bottom: 1px solid #eaeaea; padding-bottom: 8px; margin: 0 0 12px 0;">Delivery Address</h3>
                    <p style="font-size: 13px; line-height: 1.6; color: #333333; margin: 0; font-weight: 400;">
                      <strong>${customerName}</strong><br>
                      ${shippingDetails.address}${shippingDetails.apartment ? `, ${shippingDetails.apartment}` : ''}<br>
                      ${shippingDetails.city}, ${shippingDetails.country}<br>
                      <span style="color: #7a7a7a; font-size: 12px; display: block; margin-top: 5px;">Phone: ${shippingDetails.phone}</span>
                    </p>
                  </td>
                </tr>

                <!-- LINE ITEMS -->
                <tr>
                  <td style="padding: 0 40px 30px 40px;">
                    <h3 style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #7a7a7a; border-bottom: 2px solid #000000; padding-bottom: 8px; margin: 0 0 10px 0;">Items Summary</h3>
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      ${itemRows}
                      
                      <!-- TOTAL -->
                      <tr>
                        <td style="padding: 25px 0 0 0; text-align: left; border-top: 1px solid #1a1a1a;">
                          <span style="font-size: 15px; font-weight: 700; color: #1a1a1a; text-transform: uppercase; letter-spacing: 0.5px;">Grand Total</span>
                        </td>
                        <td style="padding: 25px 0 0 0; text-align: right; border-top: 1px solid #1a1a1a;">
                          <span style="font-size: 18px; font-weight: 800; color: #d4608a;">PKR ${totalPrice.toLocaleString()}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- TRACK BUTTON -->
                <tr>
                  <td align="center" style="padding: 10px 40px 40px 40px;">
                    <a href="${baseUrl}/track?orderId=${order._id}" style="background-color: #000000; color: #ffffff; text-decoration: none; padding: 14px 35px; border-radius: 50px; font-weight: 700; font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; display: inline-block; box-shadow: 0 6px 15px rgba(0,0,0,0.12); transition: all 0.2s ease;">Track Your Order</a>
                  </td>
                </tr>

                <!-- FOOTER -->
                <tr>
                  <td align="center" style="background-color: #fafafa; border-top: 1px solid #eaeaea; padding: 30px 40px; font-size: 11px; color: #888888; line-height: 1.6;">
                    <p style="margin: 0 0 8px 0;">If you have any questions about this order, please reach out to us at <a href="mailto:genz.skinstudio@gmail.com" style="color: #000000; text-decoration: underline; font-weight: 500;">genz.skinstudio@gmail.com</a>.</p>
                    <p style="margin: 0; font-weight: 300;">&copy; ${new Date().getFullYear()} GenZ Skin Studio. All rights reserved.</p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const info = await sendEmail({
      to: contact.email,
      subject: `Order Confirmation #${orderIdStr} | GenZ Skin Studio`,
      html,
      text: `Thank you for your order, ${customerName}! We have received order #${orderIdStr}. Total: PKR ${totalPrice.toLocaleString()}. You can track it here: ${baseUrl}/track?orderId=${order._id}`,
    });

    return info;
  } catch (error) {
    console.error('Error constructing or sending order invoice email:', error);
    throw error;
  }
};
