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
let RefreshToken = models.Refreshtoken;
const privateKey  = fs.readFileSync(path.resolve(__dirname, '../keys/'+process.env["PRIVATE_KEY_NAME"]), 'utf8');
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

let validateUser = (username, password, nonce) => {  
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
      let passwordBase64DecodedBuff = Buffer.from(user.password, 'base64');  
      let nonceBuff = Buffer.from(nonce);
      let passwordNonce = Buffer.concat([passwordBase64DecodedBuff, nonceBuff]);
      let concatenatedHash = crypto.createHash("sha256").update(passwordNonce).digest('base64')
      //var passwordIsValid = bcrypt.compareSync(password, user.password);
      var passwordIsValid = (password == concatenatedHash);
      if (!passwordIsValid) {
        //return res.status(401).send({ auth: false, accessToken: null, reason: "Invalid Password!" });
        //throw new Error("Invalid Password!")
        let isBcryptPasswordValid = bcrypt.compareSync(password, user.password);
        if(!isBcryptPasswordValid) {
          reject("Invalid Password!")  
        }        
      }
      resolve(user);    
    })   
  })
}

let populatePermissions = (roles) => {
  let permissions_roles = {};
  roles.forEach((role) => {        
    let permissions = role.permissions;        
    Object.keys(permissions).forEach((permissionKey) => {
      //permissions are sorted based on priority, so single value permissions will be added only once - one with higher priority
      if(!permissions_roles.hasOwnProperty(permissionKey) && !Array.isArray(permissions[permissionKey]) && permissions[permissionKey] != 'Default') {
        //console.log(permissions[permissionKey]);
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
  return permissions_roles;
}

let getPermissions = (user, clientId) => {  
  return new Promise((resolve, reject) => {
    const query = "select r.permissions from Users u, User_Roles ur, Application ap, Roles r " +
      "where u.username = (:username) and u.deletedAt is null " +
      "and ap.clientId = (:clientId) and ap.deletedAt is null "+
      "and ur.applicationId=ap.id and ur.deletedAt is null "+
      "and ur.roleId=r.id and r.deletedAt is null and ur.userId=u.id order by ur.priority asc; "
      
    models.sequelize.query(query, {
      type: models.sequelize.QueryTypes.SELECT,
      replacements: { username: user.username, clientId: clientId }
    }).then(roles => {

      if (!roles || roles.length == 0) {
        //throw new Error('User Not Found.');
        reject("Invalid input!")
      }
      let permissions_roles = populatePermissions(roles);
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
    let user = await validateUser(req.body.username, req.body.password, req.body.nonce);
    // PRIVATE  	
    let refreshToken = bcrypt.genSaltSync(10);  
    payload.iss = process.env["HOST_PORT"] + req.originalUrl;
    payload.aud = req.body.client_id;
    payload.sub = user.username;
    payload.iat = Math.floor(Date.now() / 1000);
    payload.exp = Math.floor(Date.now() / 1000) + (86400);//24h
    //payload.exp = '24h'
    payload.nonce = req.body.nonce;

    let permissions = await getPermissions(user, req.body.client_id);
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
        payload.iss = process.env["HOST_PORT"] + req.originalUrl;
        payload.aud = req.body.client_id;
        payload.sub = user.username;
        payload.iat = Math.floor(Date.now() / 1000);
        payload.exp = Math.floor(Date.now() / 1000) + (86400);    
        //payload.exp = '24h';
        //payload.nonce = req.body.nonce;
        let permissions = await getPermissions(user, req.body.client_id);
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
    var publicKey  = fs.readFileSync(path.resolve(__dirname, '../keys/'+process.env["PUBLIC_KEY_NAME"]), 'utf8');

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

router.get('/previewPermissions', function(req, res, next) {
  try {
    let roleIds = req.query.roleIds;
    let query = 'select r.permissions from Roles r, User_Roles ur where r.id in (:roleIds) and ur.roleId=r.id order by ur.priority asc;'
    models.sequelize.query(query, {
      type: models.sequelize.QueryTypes.SELECT,
      replacements: { roleIds: roleIds.split(',') }
    }).then(roles => {

      if (!roles) {
        //throw new Error('User Not Found.');
        reject("Invalid User!")
      }    

      let permissions_roles = populatePermissions(roles);
      console.log(permissions_roles)
      res.status(200).send({ permissions: permissions_roles });      
    })   
  } catch(err) {
    console.log('err', err);
    res.status(500).send({'error': err});
  }
});

module.exports = router;