import nodemailer from 'nodemailer';

const createTransporter = () => {
   
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    throw new Error('EMAIL_USER and EMAIL_PASS must be defined in environment variables');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user,
      pass,
    },
  });
};

export const sendEmail = async ({ to, subject, text, html }) => {
  const transporter = createTransporter();
  const from = process.env.EMAIL_FROM || process.env.EMAIL_USER;

  return transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
  });
};
