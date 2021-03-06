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

module.exports = {
  sendPasswordResetLink
}

