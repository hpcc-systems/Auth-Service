var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
var fs = require('fs');
const path = require("path");
let models = require('../models');
let User = models.User;
let Role = models.Role;
let UserRoles = models.User_Roles;
let Permissions = models.Permission;
let Audit = models.Audit;
const jwksClient = require('jwks-rsa');
const { body, query, check, validationResult } = require('express-validator');
const errorFormatter = ({ location, msg, param, value, nestedErrors }) => {    
  return `${location}[${param}]: ${msg}`;
};


/* GET users listing. */
router.post('/login', [
  body('username')
    .matches(/^[a-zA-Z]{1}[a-zA-Z0-9_-]*$/).withMessage('Invalid User Name'),
  body('password').isLength({ min: 4 })  
], (req, res) => {
  const errors = validationResult(req).formatWith(errorFormatter);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }

  User.findOne({
    where: {
      username: req.body.username
    },
    include:[{model: models.Role, include: [models.Permission] }]
  }).then(user => {
    console.log(user);
    if (!user) {
      throw new Error('User Not Found.');
    }

    var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
    if (!passwordIsValid) {
      //return res.status(401).send({ auth: false, accessToken: null, reason: "Invalid Password!" });
      throw new Error("Invalid Password!")
    }
    // PRIVATE
  	var privateKey  = fs.readFileSync(path.resolve(__dirname, '../keys/jwt_key'), 'utf8');
  	//Permissions.findAll({where: {id:user.Roles[0].permissions}, attributes: ['id','name'], raw: true}).then(permissions => {
      // PAYLOAD
      var payload = {
       id: user.id,
       firstName: user.firstName,
       lastName: user.lastName,
       username: user.username,
       email: user.email,
       organization: user.organization,
       role: user.Roles
      };

      // SIGNING OPTIONS
      var signOptions = {
       expiresIn:  "24h",
       algorithm:  "RS256"
      };
      console.log('payload: '+JSON.stringify(payload));
      var token = jwt.sign(payload, privateKey, signOptions);

      Audit.create({username:req.body.username, action:'login'}).then(audit => {
        console.log('audit created for login:'+ req.body.username);
      });
      res.cookie('auth',token);
      res.status(200).send({ auth: true, accessToken: token });
    //})

  }).catch(err => {
    console.log(err);
    res.status(500).send('Error -> ' + err);
  });
});

router.get('/getKey', function(req, res, next) {
  // PRIVATE and PUBLIC key
  try {
    var publicKey  = fs.readFileSync(path.resolve(__dirname, '../keys/jwt_converted_key.pub'), 'utf8');
    res.status(200).send({ alg: "RS256", key : publicKey, kid: "xZsbbaPkDTV7RQUtoqJl" });
  } catch(err) {
    console.log('err', err);
    res.status(500).send('Error -> ' + err);
  };
});

router.post('/verify', function(req, res, next) {
  try {
    var verifyOptions = {
     expiresIn:  "24h",
     algorithms:  "RS256"
    };

    // PUBLIC key
    var publicKey  = fs.readFileSync(path.resolve(__dirname, '../keys/jwt_converted_key.pub'), 'utf8');

    let token = req.headers['x-access-token'] || req.headers['authorization'];
    console.log('token-1 '+token)
    if (token.startsWith('Bearer ')) {
      token = token.slice(7, token.length);
    }
    console.log('token: '+token);
    var verified = jwt.verify(token, publicKey, verifyOptions);

    res.status(200).send({ verified: verified });

  } catch(err) {
    console.log('err', err);
    res.status(500).send('Error -> ' + err);
  }
});

router.post('/registerUser', [
  body('firstName')
    .matches(/^[a-zA-Z]{1}[a-zA-Z0-9_-]*$/).withMessage('Invalid First Name'),
  body('lastName').optional({checkFalsy:true})
    .matches(/^[a-zA-Z]{1}[a-zA-Z0-9_-]*$/).withMessage('Invalid Last Name'),
  body('username')
    .matches(/^[a-zA-Z]{1}[a-zA-Z0-9_-]*$/).withMessage('Invalid User Name'),
  body('email').optional({checkFalsy:true})
    .isEmail().withMessage('Invalid Email Address'),
  body('organization').optional({checkFalsy:true})
    .matches(/^[a-zA-Z]{1}[a-zA-Z0-9_-]*$/).withMessage('Invalid Organization Name'),        
  body('password').optional({checkFalsy:true}).isLength({ min: 4 })  
], (req, res) => {
  const errors = validationResult(req).formatWith(errorFormatter);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }
  var fieldsToUpdate={}, hash;
  try {
    if (req.body.password) {
        hash = bcrypt.hashSync(req.body.password, 10);
    }
    User.findOrCreate({
      where: {username: req.body.username},
      include: [{model:Role}],
      defaults: {
        "firstName": req.body.firstName,
        "lastName": req.body.lastName,
        "username": req.body.username,
        "password": hash,
        "email": req.body.email,
        "organization": req.body.organization
      }
    }).then(async function(result) {
      let promises=[];     
      //update scenario
      if(!result[1]) {
        let missingRoleFound = false;
        let roles = await Role.findAll({where: {"applicationId": req.body.applicationId, "name":req.body.role}})          
        console.log('roles found: '+roles.length);
        roles.map((role) => {
          if(result[0].Roles.filter(userRole => userRole.id == role.id).length == 0) {
            missingRoleFound = true;
            promises.push(result[0].addRole(role));
          }
        });
        if(!missingRoleFound) {
          return res.status(500).json({ error: 'There is already a user account associated with this user name' });
        }
        Promise.all(promises).then(() => {
          res.status(202).json({"success":"true"});             
        });
    } else {  
        //new user
        Role.findAll({where: {"name":req.body.role}}).then(function(roles) {
          roles.forEach((role) => {
            promises.push(result[0].addRole(role))
          });          
        })   
        Promise.all(promises).then(() => {
          res.status(201).json({"success":"true"});
        });             
      }  
    }), function(err) {
        return res.status(500).send(err);
    }
  } catch (err) {
      console.log('err', err);
  }
});



module.exports = router;
