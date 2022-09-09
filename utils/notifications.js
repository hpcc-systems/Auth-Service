require('dotenv').config();
const nodemailer = require("nodemailer");
const { reset } = require('nodemon');

const sendPasswordResetLink = async (receiver_email, fristName, lastName, resetUrl) => {
  const transporter = nodemailer.createTransport({
    host: process.env.HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {},
    tls:{
        rejectUnauthorized: false
    }
  });

  // const transporter = nodemailer.createTransport({
  //   service: process.env.SERVICE,
  //   auth: {
  //      user: process.env.SENDER,
  //     pass: process.env.PASSWORD
  //   }
  // });

  const options = {
    from: process.env.SENDER,
    to: receiver_email,
    subject: "Reset Password",
    text: `A password reset url has been requested for the ECL Cloud IDE account associated with the email address ${receiver_email} Click the link below to complete this reset:
    ${resetUrl}`,
    html : ` <p> A password reset url has been requested for the Tombolo account associated with the email address ${receiver_email}. Please click  <a href="${resetUrl}"> here</a> to complete the password reset.
   </p>`
  };

  try{
    let info = await transporter.sendMail(options);
    return info;
  }catch (error){
    console.log(error)
  return error;
  }
};


const notify = async ({emailAddress, emailTitle, emailBody, sender}) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SMTP_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {},
    tls: {
      rejectUnauthorized: false,
    },
  });

  const options = {
    from: sender || process.env.EMAIL_SENDER,
    to: emailAddress,
    subject: emailTitle,
    text: emailBody,
    html: ` <p>${emailBody}</p>`,
  };

  try {
    let info = await transporter.sendMail(options);
    console.log('------------------------------------------');
    console.log(info)
    console.log('------------------------------------------');
    return info;
  } catch (error) {
    console.log(error);
    return error;
  }
};

const emailVerificationTemplate = ({appName, url}) =>{
  return `<html>
    <p>Hello,</p>
    <p> <a href=${url}>Click here </a> to confirm your email address and complete setting up your ${appName} account.</p>
    <p>If clicking the link above did not work, please copy and paste the following link in your browser. If you did not create an account with ${appName}, you can safely delete this email.<p>
    <p>${url} </p>
    <p> - ${appName} </p>

  </html>`;
}

module.exports = {
  sendPasswordResetLink,
  notify,
  emailVerificationTemplate,
};

