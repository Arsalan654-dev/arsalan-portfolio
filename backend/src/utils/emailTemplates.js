const emailVerificationTemplate = (name, url) => ({
  subject: 'Verify Your Email - Arsalan Portfolio',
  html: `<h2>Welcome ${name}!</h2><p>Click the link below to verify your email:</p><a href="${url}">${url}</a><p>This link expires in 24 hours.</p>`
});

const forgotPasswordTemplate = (name, otp) => ({
  subject: 'Password Reset OTP - Arsalan Portfolio',
  html: `<h2>Hello ${name}</h2><p>Your OTP for password reset is: <strong>${otp}</strong></p><p>This OTP expires in 5 minutes.</p>`
});

const orderConfirmationTemplate = (name, orderNumber, items, totalAmount, discountAmount) => {
  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${item.price.toFixed(2)}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  return {
    subject: `Order Confirmed #${orderNumber} - Arsalan Portfolio`,
    html: `
      <h2>Thank you ${name}!</h2>
      <p>Your order <strong>#${orderNumber}</strong> has been placed successfully.</p>
      
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="background: #f8f9fa;">
            <th style="padding: 10px; text-align: left;">Item</th>
            <th style="padding: 10px; text-align: center;">Qty</th>
            <th style="padding: 10px; text-align: right;">Price</th>
            <th style="padding: 10px; text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
        <tfoot>
          ${discountAmount > 0 ? `
          <tr>
            <td colspan="3" style="padding: 10px; text-align: right; font-weight: bold;">Discount:</td>
            <td style="padding: 10px; text-align: right; color: #10b981;">-$${discountAmount.toFixed(2)}</td>
          </tr>
          ` : ''}
          <tr>
            <td colspan="3" style="padding: 10px; text-align: right; font-weight: bold; font-size: 1.1em;">Total:</td>
            <td style="padding: 10px; text-align: right; font-weight: bold; font-size: 1.1em; color: #7c3aed;">$${totalAmount.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
      
      <p>If you have any questions, please contact our support team.</p>
    `
  };
};

const promoCodeTemplate = (name, code, discount) => ({
  subject: 'You Received a Promo Code! - Arsalan Portfolio',
  html: `<h2>Congratulations ${name}!</h2><p>You received a promo code: <strong>${code}</strong></p><p>Get ${discount}% off on your next purchase!</p>`
});

module.exports = { emailVerificationTemplate, forgotPasswordTemplate, orderConfirmationTemplate, promoCodeTemplate };
