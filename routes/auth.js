require('dotenv').config();
var express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require("crypto");
const fs = require('fs');
const path = require("path");
const models = require('../models');
const User = models.User;
const Role = models.Role;
const UserRoles = models.User_Roles;
const Audit = models.Audit;
const Application = models.Application;
const PasswordReset = models.PasswordReset;
const Email_verification_code = models.Email_verification_code;
const NotificationModule = require('../utils/notifications');
const { body, query, param, validationResult } = require('express-validator');
const {notify, emailVerificationTemplate} = require("../utils/notifications")
const { v4: uuidv4 } = require("uuid");

const errorFormatter = ({ location, msg, param, value, nestedErrors }) => {    
  return `${location}[${param}]: ${msg}`;
};
const privateKey  = fs.readFileSync(path.resolve(__dirname, '../keys/' + process.env["PRIVATE_KEY_NAME"]), 'utf8');
let Sequelize = require('sequelize');

const Op = Sequelize.Op;

//Hash Password function -> 
 let hashPassword = (password) => {
  let salt = password.substring(0, 2);
  return crypto.createHash("sha256").update(salt+password).digest('base64');
}

let findApplication = (clientId) => {
  return Application.findOne({where: {clientId:clientId}})
}

// LOGIN ROUTE -> if valid user found, issues a jwt token
router.post(
  '/login',
  [
    body('username')
      .matches(/^[a-zA-Z]{1}[a-zA-Z0-9_-]*$/)
      .withMessage('Invalid User Name'),
    body('password').isLength({ min: 4 }),
    body('clientId')
      .matches(/^[a-zA-Z]{1}[a-zA-Z0-9 _-]*$/)
      .optional()
      .withMessage('Invalid Client Id'),
  ],
  async (req, res) => {
    //Check if errors in payload
    const errors = validationResult(req).formatWith(errorFormatter);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, errors: errors.array() });
    }

    //If no errors in payload 
    const { username, password, clientId } = req.body;
    try {
      const user = await User.findOne({
        where: {
          username: username,
        },
        include: [{ model: models.Role }, { model: models.Application }],
      });

      if (!user) {
        throw new Error('User Not Found.');
      }

      //Check if password match
      const userProvidedPasswordHash = hashPassword(password)
      if(userProvidedPasswordHash !== user.password){
        throw new Error("Invalid Password.");
      }

      let tokenTtl; // Get from application
      let application;

      if (clientId) {
        const hasPermission = user.Applications.some(({ clientId: client_id }) => client_id === clientId);
        if (!hasPermission) {
          throw new Error('Unauthorized');
        }
        user.clientId = user.Applications.find(({ clientId: client_id }) => client_id === clientId).clientId;
        application = await Application.findOne({ where: { clientId }, raw: true });
        if(application && application.tokenTtl) tokenTtl = application.tokenTtl * 60; // Changing minutes to seconds
      }

      if(application){
       if (application.registrationConfirmationRequired && !user.accountVerified){
            return res.status(200).send({ accountVerified : false});
       }
      }
      // Payload
      var payload = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        organization: user.organization,
        role: user.Roles,
        clientId: user.clientId,
      };

      // Token signing options
      var signOptions = {
        expiresIn: tokenTtl || 3600, // If expiresIn is not string it is treated as seconds
        algorithm: 'RS256',
      };

      var token = jwt.sign(payload, privateKey, signOptions);

      //Make entry into the audit table
      Audit.create({ username: req.body.username, action: 'login' }).then((audit) => {
        res.status(200).send({ auth: true, accessToken: token, accountVerified: true });
      });
    } catch (err) {
      console.log(err);
      res.status(500).send({success: false,  message : err.message});
    }
  }
);


router.post('/verify', function(req, res, next) {
  try {
    // Public key
    var publicKey  = fs.readFileSync(path.resolve(__dirname, '../keys/'+process.env["PUBLIC_KEY_NAME"]), 'utf8');

    let token = req.headers['x-access-token'] || req.headers['authorization'];

    if (token.startsWith('Bearer ')) {
      token = token.slice(7, token.length);
    }
    var verified = jwt.verify(token, publicKey);

    const { clientId: tokenClientId, id } = jwt.decode(token);

    if (tokenClientId) {
      User.findOne({
        where: {id},
        include:[{model: models.Role},{model: models.Application,where: {clientId: tokenClientId}}]
      }).then(user => {
        if (!user) throw new Error("Unauthorized");
  
        res.status(200).send({ verified: verified })
      }).catch(err => {
        console.log('err', err);
        res.status(500).send('Error -> ' + err);
      })
    } else {
      res.status(200).send({ verified: verified })
    }
  } catch(err) {
    console.log('err', err);
    res.status(500).send('Error -> ' + err);
  }
});

// REGISTER USER
router.post(
  "/registerUser",
  [
    body("firstName")
      .matches(/^[a-zA-Z]{1}[a-zA-Z ]*$/)
      .withMessage("Invalid first name - First name must start with a letter and can contain only alphabets and spaces"),
    body("lastName")
      .matches(/^[a-zA-Z]{1}[a-zA-Z ]*$/)
      .withMessage("Invalid last name - Last name must start with a letter and can contain only alphabets and spaces"),
    body("username")
      .matches(/^[a-zA-Z]{1}[a-zA-Z0-9]*$/)
      .withMessage( "Invalid Username - Username can only contain letters and numbers"),
    body("email").isEmail().withMessage("Invalid Email Address"),
    body("role")
      .optional({ checkFalsy: true })
      .matches(/^[a-zA-Z]{1}[a-zA-Z0-9 _-]*$/)
      .withMessage("Invalid Role -  Role must start with a letter and can contain only alphabets, numbers, spaces, _ and -" ),
    body("clientId")
      .optional({ checkFalsy: true })
      .matches(/^[a-zA-Z]{1}[a-zA-Z0-9_-]*$/)
      .withMessage("Invalid ClientID -  ClientID must start with a letter and can contain only alphabets, numbers, _ and -"),
    body("organization")
      .optional({ checkFalsy: true })
      .matches(/^[a-zA-Z]{1}[a-zA-Z0-9_-]*$/)
      .withMessage( "Invalid Organization Name - Organization name can contain only letters, numbers, _ and -"),
    body("password")
      .matches(/(?=^.{8,}$)(?=.*\d)(?=.*[!@#$%^&*]+)(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/)
      .withMessage( "Invalid password-  password must be minimum 8 characters, at least one uppercase, one lower case, one number and one of these special characters - @#$%^&* "),
  ],
  async (req, res) => {
    const errors = validationResult(req).formatWith(errorFormatter);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, errors: errors.array() });
    }
    try {
      // The register user payload comes with client ID. Grab that app id. It is needed for userRole
      const application = await Application.findOne({
        where: { clientId: req.body.clientId },
      });

      // Attempting to add user. if user with username or email already exists, it returns the user object. If it no user with matching username or email found, it creates one and returns isCreated = true
      const [user, isCreated] = await User.findOrCreate({
        where: {
          [Op.or]: [{ username: req.body.username }, { email: req.body.email }],
        },
        include: [{ model: Role }],
        defaults: {
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          username: req.body.username,
          password: hashPassword(req.body.password),
          email: req.body.email,
          organization: req.body.organization,
          accountVerified: application.registrationConfirmationRequired ? false : true,
          registrationConfirmationCode: application.registrationConfirmationRequired ? uuidv4() : null,
        },
      });

      // The register user payload come with user role. find the user role so the id can be used to create userRole
      const role = await Role.findOne({ where: { name: req.body.role } });

      // User role options
      const userRoleOptions = {
        userId: user.id,
        roleId: role.id,
        applicationId: application.id,
        priority: 1,
      };

      if (!isCreated) {
        /* User already exists -> check if user is trying to register with new role. If user is trying to register with a new role, create user role.  if user is trying to 
      register with a duplicate role return userRoleCreated = false */
        let [userRole, userRoleCreated] = await UserRoles.findOrCreate({
          where: {
            userId: user.id,
            roleId: role.id,
            applicationId: application.id,
          },
          defaults: userRoleOptions,
        });

        if (userRoleCreated) {
          // If the user role was created, return success
          return res.status(200).json({ success: true, message: "Registration successful" });
        } else {
          // If the user is trying to register for the role they already have, return failure
          return res.status(409).json({
            success: false,
            message: `Account with username/email you entered already exists`,
          });
        }
      }

      //If the payload came with unique username or E-mail - user is already created. Next make entry to UserRoles table and return success
      await UserRoles.create(userRoleOptions);
      
        if (application.registrationConfirmationRequired) { // If unable to send email, roll back -> remove user
              // The web URL must come from client
              const url = `${req.body.clientWebUrl}verifyEmail/${user.registrationConfirmationCode}`;
              const sender = `donotreply@${application.applicationType.toLowerCase()}.com`;
              const emailTitle = `${application.applicationType} - Verify your email address`;
              const emailBody = emailVerificationTemplate({ appName: application.applicationType, url });
              const notification = await notify({ emailAddress: user.email, emailBody, sender, emailTitle });

              if(notification.accepted){
                return res.status(200).json({ success: true, message: "Registration successful", emailVerificationRequired: true });
              }
                await User.destroy({where : {id : user.id}})
                return res.status(500).json({ success: false, message: "Failed to send account verification link" });
              }else{
                return res.status(200).json({ success: true, message: "Registration successful", emailVerificationRequired: false });
              }
    } catch (err) {
      console.log("[routes/auth.js/registerUser]", err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }
);



router.post('/forgotPassword', [
  body('email')
    .matches(/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$/).withMessage('Invalid E-mail'),
], (req, res) => {
  const errors = validationResult(req).formatWith(errorFormatter);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }

  try {    
    User.findOne({
      where: {
        email: req.body.email
      }      
    }).then(async user => {
      if(user == null) {  
        res.status(500).json({"success": false, "message": "User not found."});
      }else{
      let application = await findApplication(req.body.clientId);
      if(application == null) {
        res.status(500).json({"success": false, "message": "Application not found."});
      }else{
        PasswordReset.create({userid:user.id}).then((passwordReset) => {

          const token = jwt.sign({user: user.name, id: passwordReset.id}, privateKey, {expiresIn: "60m"} );

          const resetURL = `${req.body.resetUrl}/${token}`
         NotificationModule.sendPasswordResetLink(user.email,  user.firstName, user.lastName, resetURL).then(
           result => {
             if(result.accepted){
               console.log("Password reset instructions sent")
               res.status(201).json({"success":true});
             }else{
               console.log("unable to send password reset instructions")
               return res.status(599).send({"success" : false , "message" : "Unable to send password reset instructions"});
             }
      });  
        })
 }}
      
    })
    //res.status(500).json({"success":"false"});
  } catch (err) {
    console.log('err', err);
  }
});  


router.post('/resetPassword', 
[
  body('id')
  .isLength({ min: 36 }).withMessage('Invalid id'),
  body('password').isLength({ min: 8 }).withMessage('Invalid Password')
],
 (req, res) => {
  const errors = validationResult(req).formatWith(errorFormatter);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }
  if(req.body.id){  
    try {
      payload = jwt.verify(req.body.id, privateKey)

    } catch (e) {
      if (e instanceof jwt.JsonWebTokenError) {
        // if the error thrown is because the JWT is unauthorized, return a 401 error

        return res.status(401).json({error: 'Expired or invalid link'})
      }
      // otherwise, return a bad request error
      return res.status(400).json({error: 'Bad request'})
    }
  }


  try {    
    PasswordReset.findOne({where: {id:payload.id}}).then((resetRecord) => {
    // PasswordReset.findOne({where: {id:req.body.id}}).then((resetRecord) => {
      if(resetRecord == null) {
        res.status(500).json({"success":"false", "message": "Invalid Password Reset Request"});          
      } else {
        console.log('resetRecord: '+resetRecord)
        User.findOne({
          where: {
            id: resetRecord.userid
          }      
        }).then(user => {
          if(user == null) {
            res.status(500).json({"success":"false", "message": "Invalid Password Reset Request"});
          }
          let hash = hashPassword(req.body.password);
          User.update(
            {password: hash},
            {where: {id: resetRecord.userid}
          }).then((application) => {
            PasswordReset.destroy({where:{id:req.body.id}}).then(() => {
              res.status(200).json({"success":"true"});
            })          
          })
        })
      }
    })
  } catch (err) {
    console.log('err', err);
  }
}); 

//Verify Email 
router.post("/verifyEmail", [
  body('code').isUUID(),
], async (req, res) => {
   const errors = validationResult(req).formatWith(errorFormatter);
   const {code}  = req.body;
    
    if (!errors.isEmpty()) {
      console.log(errors)
      return res.status(422).json({ success: false, message: 'Invalid verification link'});
    }

    try{
       const updated = await User.update(
         { registrationConfirmationCode: null, accountVerified: true },
         { where: { registrationConfirmationCode: code } }
       );
      if(updated[0] > 0){
        await Email_verification_code.create({ verificationCode: code });
        res.status(200).json({success: true,  message: 'Email verified successfully'})
      }else{
        const verified = await Email_verification_code.findOne({where: { verificationCode: code}})
        if(verified){
          console.log('Email already verified')
          res.status(409).json({success: false, message: 'Email already verified' })
        }else{
           res.status(400).json({success: false, message: 'Invalid verification link' })
        }
      }
    }catch(err){
      console.log('------------------------------------------');
      console.dir({err}, {depth: null})
      console.log('------------------------------------------');
      res.status(500).json({success: false, message : 'Failed to process request'})
    }
});


//Resend verification Email
router.post(
  "/reSendVerificationEmail",
  [
    body("username")
      .matches(/^[a-zA-Z]{1}[a-zA-Z0-9_-]*$/)
      .withMessage("Invalid User Name"),
    body("clientId")
      .matches(/^[a-zA-Z]{1}[a-zA-Z0-9 _-]*$/)
      .withMessage("Invalid Client Id"),
    body("clientWebUrl")
      .matches(/^[a-zA-Z]{1}[a-zA-Z0-9\/\:_-]*$/)
      .withMessage("Invalid Client web URL"),
  ],
  async (req, res) => {
    //Check if errors in payload
    const errors = validationResult(req).formatWith(errorFormatter);
    if (!errors.isEmpty()) {
      const {errors : validationErrors} = errors;
      const errorString = validationErrors.map((err) => {
        return err.msg;
      }).join(',');
      return res.status(422).json({ success: false, message: errorString});
    }

    try {
      const { username, clientWebUrl, clientId } = req.body;
      //Get user object so email address can be extracted to send email
      const user = await User.findOne({ where: { username }, raw: true });
      if (!user || (user.accountVerified && !user.registrationConfirmationCode)) {
        return res.status(400).json({ success: false, message: "User not found or account already verified" });
      }

      // Garb Application name so the sender email address can be formed. ex donotreply@tombolo.com
      const application = await Application.findOne({
        where: { clientId },
      });
      if (!application) {
        return res.status(400).json({ success: false, message: "Application not found" });
      }

      //If all checks passed and user is eligible to receive new verification link
      const newVerificationCode = uuidv4();
      const updated = await User.update({ registrationConfirmationCode: newVerificationCode }, { where: { username, accountVerified: false } });

      if (updated[0] > 0) {
        // User updated - now send email
        const url = `${clientWebUrl}verifyEmail/${newVerificationCode}`;
        const sender = `donotreply@${application.applicationType.toLowerCase()}.com`;
        const emailTitle = `${application.applicationType} - Verify your email address`;
        // const emailBody = `<p>Hello ${user.firstName},</p><p> click <a href=${url} /> here </a> to verify your email </p>`;
        const emailBody = emailVerificationTemplate({ appName: application.applicationType, url });
        const notification = await notify({ emailAddress: user.email, emailBody, sender, emailTitle });

        if (notification.accepted) {
          return res.status(200).json({ success: true, message: "New verification link sent successfully ", emailVerificationRequired: true });
        }
        throw new Error("Failed to send new verification E-mail");
      }
    } catch (err) {
      res.status(500).send({ success: false, message: err.message });
    }
  }
);

module.exports = router;
