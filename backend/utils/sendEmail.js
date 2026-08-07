const { Resend } = require('resend');

const sendEmail = async (options) => {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

    const data = await resend.emails.send({
      from: 'onboarding@resend.dev', // Resend's default testing address
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html || `<p>${options.message}</p>` 
    });

    console.log("Email sent successfully via Resend:", data);
  } catch (error) {
    console.error("Background email failed:", error);
  }
};

module.exports = sendEmail;