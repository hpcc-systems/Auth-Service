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
  iss:'hpcc_systems_issuer',  
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
      },
      include:[{model: models.Role, include: [models.Permission] }]
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

let populatePermissions = (user) => {
  let permissions_roles = {};
  user.Roles.forEach((role) => {
    console.log(role);
    console.log(role.permissions);
    //if more than one permission, set as a array, else add as string
    let permissions = JSON.parse(role.permissions);
    permissions.forEach((permission) => {
      if(permissions_roles.hasOwnProperty(permission.name)) {
        let accessTypes = new Set(permissions_roles[permission.name].concat(permission.accessType.split(',')))
        permissions_roles[permission.name] = Array.from(accessTypes);
      } else {
        permissions_roles[permission.name] = permission.accessType.indexOf(',') > 0 ? permission.accessType.split(',') : permission.accessType;
      }
    })
    /*if(role.permissions.length > 1) {
      let permissions = [];
      role.permissions.forEach((permission) => {          
        permissions.push(permission.name);
      })
      permissions_roles[role.name] = permissions;
    } else {
      permissions_roles[role.name] = role.Permissions[0].name
    }*/
  })
  console.log('permissions_roles: '+JSON.stringify(permissions_roles));
  return permissions_roles;
}

router.post('/login', [
  body('username')
    .matches(/^[a-zA-Z]{1}[a-zA-Z0-9_-]*$/).withMessage('Invalid User Name'),
  body('password').isLength({ min: 4 })  
], async (req, res) => {
  const errors = validationResult(req).formatWith(errorFormatter);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }
  try {
    let user = await validateUser(req.body.username, req.body.password);
    // PRIVATE  	
    let refreshToken = bcrypt.genSaltSync(10);  
    console.log('refreshToken: '+refreshToken);
    //payload.refresh_token = refreshToken;
    payload.sub = user.username;
    payload.iat = Math.floor(Date.now() / 1000);
    payload.exp = Math.floor(Date.now() / 1000) + (60 * 15);
    payload.nonce = req.body.nonce;

    let fullPayload = {
      ...payload,
      ...populatePermissions(user)
    }
    console.log(JSON.stringify(fullPayload));
    //console.log('payload: '+JSON.stringify(payload));
    var token = jwt.sign(fullPayload, privateKey, signOptions);
    //invalidate current refresh token
    RefreshToken.update({revoked:1, last_accessed: new Date()}, {where:{username: req.body.username}}).then(audit => {
      //store new refresh token
      RefreshToken.create({username:req.body.username, token: refreshToken, last_accessed: new Date()}).then(audit => {
        console.log('refresh token stored:'+ req.body.username);
         Audit.create({username:req.body.username, action:'login'}).then(audit => {
          console.log('audit created for login:'+ req.body.username);
            res.status(200).send({'token_type':'Bearer', 'refresh_token': refreshToken, 'id_token': token });        
        });
      });
    });
  } catch(err) {
    console.log(err);
    res.status(500).send({'error': err});
  };
});


router.post('/tokenrefresh', async function(req, res, next) {
  try {        

    RefreshToken.findOne({
      where: {
        token: req.body.refresh_token, revoked: 0
      }    
    }).then(token => {    
      if(!token) {
        res.status(401).send({'error': 'Invalid refresh token'});
      }
      User.findOne({
        where: {
          username: token.username
        },
        include:[{model: models.Role, include: [models.Permission] }]
      }).then(user => {
        let newRefreshToken = bcrypt.genSaltSync(10);  
        console.log('newRefreshToken: '+newRefreshToken);
        let username = user.username;
        console.log('username: '+user.username);
        //payload.refresh_token = newRefreshToken;
        payload.sub = user.username;
        payload.iat = Math.floor(Date.now() / 1000);
        payload.exp = Math.floor(Date.now() / 1000) + (60 * 15);    
        //payload.nonce = req.body.nonce;
        let fullPayload = {
          ...payload,
          ...populatePermissions(user)
        }

        var token = jwt.sign(fullPayload, privateKey, signOptions);

        RefreshToken.update({revoked:1, last_accessed: new Date()}, {where:{token: req.body.refresh_token}}).then(audit => {
          RefreshToken.create({username:username, token: newRefreshToken, last_accessed: new Date()}).then(audit => {
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