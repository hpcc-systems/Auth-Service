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
let Audit = models.Audit;
const jwksClient = require('jwks-rsa');

/* GET users listing. */
router.post('/login', function(req, res, next) {
  User.findOne({
    where: {
      username: req.body.username
    },
    include: [{model:Role}]
  }).then(user => {
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
  	// PAYLOAD
  	var payload = {
  	 firstName: user.firstName,
  	 lastName: user.lastName,
  	 username: user.userName,
  	 email: user.email,
  	 organization: user.organization,
  	 role: user.Roles[0].name
  	};

  	// SIGNING OPTIONS
  	var signOptions = {
  	 expiresIn:  "12h",
  	 algorithm:  "RS256"
  	};
    var token = jwt.sign(payload, privateKey, signOptions);

    Audit.create({username:req.body.username, action:'login'}).then(audit => {
      console.log('audit created for login:'+ req.body.username);
    });
    res.cookie('auth',token);
    res.status(200).send({ auth: true, accessToken: token });

  }).catch(err => {
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
     expiresIn:  "12h",
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


module.exports = router;
