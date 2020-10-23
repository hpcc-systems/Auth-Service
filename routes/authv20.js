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
let Application = models.Application;
let RefreshToken = models.Refreshtoken;
const privateKey  = fs.readFileSync(path.resolve(__dirname, '../keys/jwt_key'), 'utf8');
const { body, query, check, validationResult } = require('express-validator');
const errorFormatter = ({ location, msg, param, value, nestedErrors }) => {    
  return `${location}[${param}]: ${msg}`;
};

const signOptions = {
 algorithm:  "RS256"
};

let payload = {
  //iss:'hpcc_systems_issuer',  
  aud:'hpcc_systems_platform'  
}

let validateUser = (username, password) => {  
  return new Promise((resolve, reject) => {
    if(!username) {
      reject("Username required!")
    }
    if(!password) {
      reject("Password required!")
    }
    User.findOne({
      where: {
        username: username
      }
    }).then(user => {
      if (!user) {
        //throw new Error('User Not Found.');
        reject("Invalid User!")
      }

      var passwordIsValid = bcrypt.compareSync(password, user.password);
      if (!passwordIsValid) {
        //return res.status(401).send({ auth: false, accessToken: null, reason: "Invalid Password!" });
        //throw new Error("Invalid Password!")
        reject("Invalid Password!")
      }
      resolve(user);    
    })   
  })
}

let populatePermissions = (user, clientId) => {  
  return new Promise((resolve, reject) => {
    const query = "select r.Permissions from Users u, User_Roles ur, Application ap, Roles r " +
      "where u.username = (:username) and u.deletedAt is null " +
      "and ap.clientId = (:clientId) and ap.deletedAt is null "+
      "and ur.applicationId=ap.id and ur.deletedAt is null "+
      "and ur.roleId=r.id and r.deletedAt is null order by ur.priority asc; "
      
    models.sequelize.query(query, {
      type: models.sequelize.QueryTypes.SELECT,
      replacements: { username: user.username, clientId: clientId }
    }).then(roles => {

      if (!roles) {
        //throw new Error('User Not Found.');
        reject("Invalid User!")
      }
      console.log(roles);      
      let permissions_roles = {};
      roles.forEach((role) => {        
        let permissions = role.permissions;        
        Object.keys(permissions).forEach((permissionKey) => {
          //permissions are sorted based on priority, so single value permissions will be added only once - one with higher priority
          if(!permissions_roles.hasOwnProperty(permissionKey) && !Array.isArray(permissions[permissionKey]) && permissions[permissionKey] != 'Default') {
            console.log(permissions[permissionKey]);
            permissions_roles[permissionKey] = permissions[permissionKey]
          } else if(Array.isArray(permissions[permissionKey])) {
            //assuming the permission is something like (AllowWorkunitScopeXXX, DenyWorkunitScopeXXX, AllowFileScopeXXX, or DenyFileScopeXXX) for HPCC
            if(permissions_roles[permissionKey]) {              
              permissions_roles[permissionKey] = [...permissions_roles[permissionKey], ...permissions[permissionKey]];
              //remove duplicate scope patterns
              const uniqueScopeValues = [...new Set(permissions_roles[permissionKey])];
              permissions_roles[permissionKey] = uniqueScopeValues;
            } else {
              permissions_roles[permissionKey] = permissions[permissionKey];
            }
          }
        })    
      })      
      resolve(permissions_roles);

    }).catch(error => {
      console.log(error);
      reject(error);
    })   
  })

}

router.post('/login', [  
  body('username')
    .matches(/^[a-zA-Z]{1}[a-zA-Z0-9_-]*$/).withMessage('Invalid User Name'),
  body('password').isLength({ min: 4 }),  
  body('client_id').exists(),
  body('client_id').not().isEmpty()
], async (req, res) => {  
  const errors = validationResult(req).formatWith(errorFormatter);
  if (!errors.isEmpty()) {
    return res.status(422).json({ error: "Invalid input" });
  }
  console.log('URL: '+req.protocol + '://' + req.get('host') + req.originalUrl);
  try {
    let user = await validateUser(req.body.username, req.body.password);
    // PRIVATE  	
    let refreshToken = bcrypt.genSaltSync(10);  
    payload.iss = req.protocol + '://' + (req.get('host') || req.get('X-Forwarded-Host')) + req.originalUrl;
    payload.sub = user.username;
    payload.iat = Math.floor(Date.now() / 1000);
    payload.exp = Math.floor(Date.now() / 1000) + (60 * 15);
    payload.nonce = req.body.nonce;

    let permissions = await populatePermissions(user, req.body.client_id);
    console.log(permissions)
    let fullPayload = {
      ...payload,
      ...permissions
    }

    var token = jwt.sign(fullPayload, privateKey, signOptions);
    //invalidate current refresh token
    RefreshToken.update({revoked:1, last_accessed: new Date()}, {where:{client_id: req.body.client_id}}).then(audit => {
      //store new refresh token
      RefreshToken.create({username:req.body.username, client_id: req.body.client_id, token: refreshToken, last_accessed: new Date()}).then(audit => {
         Audit.create({username:req.body.username, action:'login'}).then(audit => {
            res.status(200).send({'token_type':'Bearer', 'refresh_token': refreshToken, 'id_token': token });        
        });
      });
    });
  } catch(err) {
    console.log(err);
    res.status(500).send({'error': err});
  };
});


router.post('/tokenrefresh', [
  body('refresh_token').exists(),
  body('refresh_token').not(),
  body('client_id').exists(),
  body('client_id').not().isEmpty()
], async function(req, res, next) {
  const errors = validationResult(req).formatWith(errorFormatter);
  if (!errors.isEmpty()) {
    return res.status(422).json({ error: "Invalid input" });
  }
  try {        
    RefreshToken.findOne({
      where: {
        token: req.body.refresh_token, revoked: 0, client_id: req.body.client_id
      }    
    }).then(token => {    
      if(!token) {
        res.status(401).send({'error': 'Invalid refresh token'});
      }
      User.findOne({
        where: {
          username: token.username
        },
        include:[{model: models.Role }]
      }).then(async user => {
        let newRefreshToken = bcrypt.genSaltSync(10);  
        let username = user.username;
        //payload.refresh_token = newRefreshToken;
        payload.iss = req.protocol + '://' + (req.get('host') || req.get('X-Forwarded-Host')) + req.originalUrl;
        payload.sub = user.username;
        payload.iat = Math.floor(Date.now() / 1000);
        payload.exp = Math.floor(Date.now() / 1000) + (60 * 15);    
        //payload.nonce = req.body.nonce;
        let permissions = await populatePermissions(user, req.body.client_id);
        let fullPayload = {
          ...payload,
          ...permissions
        }

        var token = jwt.sign(fullPayload, privateKey, signOptions);

        RefreshToken.update({revoked:1, last_accessed: new Date()}, {where:{token: req.body.refresh_token, client_id: req.body.client_id}}).then(audit => {
          RefreshToken.create({username:username, token: newRefreshToken, client_id: req.body.client_id, last_accessed: new Date()}).then(audit => {
            res.status(200).send({ 'token_type':'Bearer', 'refresh_token': newRefreshToken, id_token: token });
          });
        });
      });
    });
  } catch(err) {
    console.log(err);
    res.status(500).send({'error': err});
  }
});

router.post('/verify', function(req, res, next) {
  try {
    var verifyOptions = {
     algorithms:  "RS256"
    };

    // PUBLIC key
    var publicKey  = fs.readFileSync(path.resolve(__dirname, '../keys/jwt_converted_key.pub'), 'utf8');

    let token = req.headers['x-access-token'] || req.headers['authorization'];
    //console.log('token-1 '+token)
    if (token.startsWith('Bearer ')) {
      token = token.slice(7, token.length);
    }
    //console.log('token: '+token);
    var verified = jwt.verify(token, publicKey, verifyOptions);
    console.log(JSON.stringify(verified));

    res.status(200).send({ verified: verified });

  } catch(err) {
    console.log('err', err);
    res.status(500).send({'error': err});
  }
});

module.exports = router;