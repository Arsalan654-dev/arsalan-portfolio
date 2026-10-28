const transporter = require('../config/nodemailer');
const { orderConfirmationTemplate, promoCodeTemplate } = require('../utils/emailTemplates');

const sendEmail = async ({ to, subject, html, attachments }) => {
  try {
    await transporter.sendMail({
      from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
      to,
      subject,
      html,
      attachments
    });
    return true;
  } catch (e) {
    console.log('Email send failed:', e.message);
    return false;
  }
};

const sendOrderConfirmation = async (user, orderNumber, items, totalAmount, discountAmount) => {
  const template = orderConfirmationTemplate(user.name, orderNumber, items, totalAmount, discountAmount);
  return await sendEmail({ to: user.email, ...template });
};

const sendPromoCode = async (user, code, discount) => {
  const template = promoCodeTemplate(user.name, code, discount);
  return await sendEmail({ to: user.email, ...template });
};

module.exports = { sendEmail, sendOrderConfirmation, sendPromoCode };
