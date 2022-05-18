require('dotenv').config();
var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require("crypto");
var fs = require('fs');
const path = require("path");
let models = require('../models');
let User = models.User;
let Role = models.Role;
let UserRoles = models.User_Roles;
let Permissions = models.Permission;
let Audit = models.Audit;
let Application = models.Application;
let PasswordReset = models.PasswordReset;
const NotificationModule = require('../utils/notifications');
const { body, query, check, validationResult } = require('express-validator');
const errorFormatter = ({ location, msg, param, value, nestedErrors }) => {    
  return `${location}[${param}]: ${msg}`;
};
const privateKey  = fs.readFileSync(path.resolve(__dirname, '../keys/' + process.env["PRIVATE_KEY_NAME"]), 'utf8');
let Sequelize = require('sequelize');
const Op = Sequelize.Op;

let hashPassword = (password) => {
  let salt = password.substring(0, 2);
  console.log(salt); 
  return crypto.createHash("sha256").update(salt+password).digest('base64');
}

let findApplication = (clientId) => {
  return Application.findOne({where: {clientId:clientId}})
}

/* GET users listing. */
router.post('/login', [
  body('username')
    .matches(/^[a-zA-Z]{1}[a-zA-Z0-9_-]*$/).withMessage('Invalid User Name'),
  body('password').isLength({ min: 4 }),
  body('clientId')
    .matches(/^[a-zA-Z]{1}[a-zA-Z0-9 _-]*$/).optional().withMessage('Invalid Client Id'),
], (req, res) => {
  const errors = validationResult(req).formatWith(errorFormatter);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }
  User.findOne({
    where: {
      username: req.body.username
    },
    include:[{model: models.Role},{model: models.Application}]
  }).then(user => {
    if (!user) {
      throw new Error('User Not Found.');
    }

    //var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
    //decode base64 to text before hashing
    let passwordBuff = new Buffer(user.password);
    //hash(stored hashed password + nonce)      
    let passwordHash = crypto.createHash("sha256").update(passwordBuff).digest('base64')
    let userProvidedPasswordHash = hashPassword(req.body.password)
    var passwordIsValid = (userProvidedPasswordHash == user.password);
    if (!passwordIsValid) {
      //Temperory: check if it is a bcrypt hashed password (old user accounts)
      let bcryptPasswordIsValid = bcrypt.compareSync(req.body.password, user.password);
      if(!bcryptPasswordIsValid) {
        throw new Error("Invalid Password!")  
      } else {
        //found a valid bcrypt password, change it to the new sha256 salted password
        let newShaPassword = hashPassword(req.body.password);
        User.update(
          { password: newShaPassword },
          { where: {username:req.body.username}}
        ).then(function (updated) {
          console.log("sha password updated");
        })
      }
      console.log('bcrypt password valid');
      //return res.status(401).send({ auth: false, accessToken: null, reason: "Invalid Password!" });      
    }

    if (req.body.clientId) {
      const hasPermission = user.Applications.some(({ clientId }) => clientId === req.body.clientId);
      
      if (!hasPermission) {
        throw new Error("Unauthorized");
      }

      user.clientId = user.Applications.find(({ clientId }) => clientId === req.body.clientId).clientId;
    }

    // PRIVATE
  	//const privateKey  = fs.readFileSync(path.resolve(__dirname, '../keys/' + process.env["PRIVATE_KEY_NAME"]), 'utf8');

  	//Permissions.findAll({where: {id:user.Roles[0].permissions}, attributes: ['id','name'], raw: true}).then(permissions => {
      // PAYLOAD
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

      // SIGNING OPTIONS
      var signOptions = {
       expiresIn:  '24h',
       algorithm:  "RS256"
      };
      console.log('payload: '+JSON.stringify(payload));
      var token = jwt.sign(payload, privateKey, signOptions);

      Audit.create({username:req.body.username, action:'login'}).then(audit => {
        console.log('audit created for login:'+ req.body.username + ' token: '+token);
        res.status(200).send({ auth: true, accessToken: token });
      });
      //res.cookie('auth',token);
      
    //})

  }).catch(err => {
    console.log(err);
    res.status(500).send('Error -> ' + err);
  });
});

router.post('/verify', function(req, res, next) {
  try {
    var verifyOptions = {
     expiresIn:  '24h',
     algorithms:  "RS256"
    };

    // PUBLIC key
    var publicKey  = fs.readFileSync(path.resolve(__dirname, '../keys/'+process.env["PUBLIC_KEY_NAME"]), 'utf8');

    let token = req.headers['x-access-token'] || req.headers['authorization'];
    console.log('token-1 '+token)
    if (token.startsWith('Bearer ')) {
      token = token.slice(7, token.length);
    }
    console.log('token: '+token);
    var verified = jwt.verify(token, publicKey, verifyOptions);

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
router.post('/registerUser', [
  body('firstName')
    .matches(/^[a-zA-Z]{1}[a-zA-Z0-9_-]*$/).withMessage('Invalid First Name'),
  body('lastName')
    .matches(/^[a-zA-Z]{1}[a-zA-Z0-9_-]*$/).withMessage('Invalid Last Name'),
  body('username')
    .matches(/^[a-zA-Z]{1}[a-zA-Z0-9_-]*$/).withMessage('Invalid User Name'),
  body('email')
    .isEmail().withMessage('Invalid Email Address'),
  body('organization').optional({checkFalsy:true})
    .matches(/^[a-zA-Z]{1}[a-zA-Z0-9_-]*$/).withMessage('Invalid Organization Name'),        
  body('password').isLength({ min: 4 })  
], async (req, res) => {
  const errors = validationResult(req).formatWith(errorFormatter);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }
  try {
    // Attempting to add user. if user with username or email already exists, it returns the user object
    // If it no user with matching username or email found, it creates one and returns isCreated = true
    const [user, isCreated] = await User.findOrCreate({
      where: {[Op.or]: [{username: req.body.username}, {email : req.body.email}]},
      include: [{model:Role}],
      defaults: {
        "firstName": req.body.firstName,
        "lastName": req.body.lastName,
        "username": req.body.username,
        "password": bcrypt.hashSync(req.body.password, 10),
        "email": req.body.email,
        "organization": req.body.organization
      }
  })

   // The register user payload come with user role. find the user role so the id can be used to create userRole
    const role = await Role.findOne({where: {"name":req.body.role}});

    // The register user payload comes with client ID. Grab that app id. It is needed for userRole
    const application = await Application.findOne({where : {"clientId" : req.body.clientId}});

    // User role options 
    const userRoleOptions = {
      userId: user.id,
      roleId : role.id,
      applicationId: application.id,
      priority : 1
    }

    if(!isCreated){
      /* User already exists -> check if user us trying to register with new role. If user is trying to register with a new role, create user role.  if user is trying to 
      register with a duplicate role return userRoleCreated = false */
      let [userRole, userRoleCreated] = await UserRoles.findOrCreate({
        where: {userId: user.id, roleId: role.id, applicationId : application.id},
        defaults : userRoleOptions
      });

      if(userRoleCreated){
        // If the user role was created, return success
        return res.status(200).json({success: true, message: 'Registration successful'});
      }else{
        // If the user is trying to register for the role they already have, return failure
        return res.status(409).json({success: false, message : `Account with username/email you entered already exists`});
      }
    }

    //If the payload came with unique username and pw - user is already created. Next make entry to UserRoles table and return success
    await UserRoles.create(userRoleOptions);
    res.status(200).json({success: true, message: 'Registration successful'});
  } catch (err) {
    console.log('[routes/auth.js/registerUser]', err);
    return res.status(500).json({success: false, message: err.message})
  }
});



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
          let hash = bcrypt.hashSync(req.body.password, 10);
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


module.exports = router;
