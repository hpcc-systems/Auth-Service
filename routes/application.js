var express = require('express');
var router = express.Router();
const bcrypt = require('bcryptjs');
let models = require('../models');
let Role = models.Role;
let Permission = models.Permission;
let Application = models.Application;
let AppPermissions = models.App_Permissions;
let Sequelize = require('sequelize');
const { body, query, check, validationResult, oneOf } = require('express-validator');
const Op = Sequelize.Op;
const errorFormatter = ({ location, msg, param, value, nestedErrors }) => {    
  return `${msg}`;
};


router.post(
  "/",
  [
    //TODO Validation not done for all fields. double check validation rules
    body("name")
      .matches(/^[a-zA-Z]{1}[a-zA-Z0-9 _-]*$/)
      .withMessage("Invalid Application Name"),
    body("email").optional({ checkFalsy: true }).isEmail().withMessage("Invalid Email Address"),
    body("owner")
      .matches(/^[a-zA-Z]{1}[a-zA-Z0-9 _-]*$/)
      .withMessage("Invalid Owner Name"),
    body("clientId")
      .matches(/^[a-zA-Z]{1}[a-zA-Z0-9 _-]*$/)
      .withMessage("Invalid Client Id"),
    body("tokenTtl")
      .matches(/^[0-9]*$/)
      .withMessage("Invalid Token TTL"),
    body("registrationConfirmationRequired").optional({checkFalsy:false}).isBoolean(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, errors: errors.array() });
    }

    let { tokenTtl, name, description, email, owner, applicationType, clientId, registrationConfirmationRequired } = req.body;

    if (tokenTtl && (tokenTtl < 300 || tokenTtl > 1440)) {
      return res.status(422).json({ success: false, message: "Token TTL must be between 300 and 1440" });
    }

    if (applicationType === "HPCC") {
      registrationConfirmationRequired = false;
    }

    Application.create({
      name: name,
      description: description,
      email: email,
      owner: owner,
      applicationType: applicationType,
      clientId: clientId,
      tokenTtl: tokenTtl,
      registrationConfirmationRequired: registrationConfirmationRequired || false,
    })
      .then((result) => {
        res.json({ result: "success" });
      })
      .catch(function (err) {
        console.log("error occured: " + err);
      });
  }
);

router.put('/', [
  body('name')
    .matches(/^[a-zA-Z]{1}[a-zA-Z0-9 _-]*$/).withMessage('Invalid Application Name'),
  body('email').optional({checkFalsy:true})
    .isEmail().withMessage('Invalid Email Address'),
  body('owner')
    .matches(/^[a-zA-Z]{1}[a-zA-Z0-9 _-]*$/).withMessage('Invalid Owner Name'),
  body('clientId')
    .matches(/^[a-zA-Z]{1}[a-zA-Z0-9 _-]*$/).withMessage('Invalid Client Id'),    
], (req, res) => {
  const errors = validationResult(req).formatWith(errorFormatter);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }
  const {id, name, description,email, owner, applicationType, clientId, tokenTtl, registrationConfirmationRequired} = req.body
  Application.update({ 
  	"name": name,
	  "description": description,
	  "email": email,
	  "owner": owner,
    "applicationType": applicationType,
    "clientId": clientId,
    "tokenTtl": tokenTtl,
    "registrationConfirmationRequired": registrationConfirmationRequired || false
	}, {where:{id:id}}).then(async (application) => {  	
  	res.json({"result":"success"});	  
  }).catch(function(err) {
     console.log("error occured: "+err);
  });
  
});

router.get('/all', function(req, res, next) {
  Application.findAll({order: [['createdAt', 'DESC']]}).then((result) => {  	  	
	  res.json(result);
  }).catch(function(err) {
     console.log("error occured: "+err);
  });
  
});

router.get('/', oneOf([
    query('id').isUUID(4).withMessage("Invalid Id"),
    query('id').isInt().withMessage("Invalid Id"),
]), (req, res) => {
  const errors = validationResult(req).formatWith(errorFormatter);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  } 
	let appId = req.query.id;
  Application.findOne({where:{"id":appId}}).then((result) => {  	  	
	  res.json(result);
  }).catch(function(err) {
     console.log("error occured: "+err);
  });
});

router.delete('/', oneOf([
    query('id').isUUID(4).withMessage("Invalid Id"),
    query('id').isInt().withMessage("Invalid Id"),
]), (req, res) => {
  const errors = validationResult(req).formatWith(errorFormatter);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  } 
  let appId = req.query.id;
  Application.destroy({where:{"id":appId}}).then((application) => {        
    res.json({"result":"success"});    
  }).catch(function(err) {
     console.log("error occured: "+err);
  });      
});

module.exports = router;