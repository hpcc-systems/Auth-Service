const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.notifyPasswordReset = (userEmail, applicationName, userName, resetUrl) => {
	console.log("notifyPasswordReset: "+userEmail, applicationName, userName, resetUrl);
  const msg={};  
  msg.to = userEmail;
  msg.from = 'hpcc-solutions-lab@lexisnexisrisk.com'; // Use the email address or domain you verified above
  msg.subject = 'Password Reset Request Instructions for Tombolo';
  msg.html = 'A password reset has been requested for '+applicationName+' account associated with user name '+userName+'. Click  the below link to reset your password. \n\n '+resetUrl;

  sgMail
  .send(msg)
  .then(() => {
  	console.log("email sent");
  }, error => {
    console.error(error);

    if (error.response) {
      console.error(error.response.body)
    }
  });
} 