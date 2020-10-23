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


router.post('/', [
  body('name')
    .matches(/^[a-zA-Z]{1}[a-zA-Z0-9_-]*$/).withMessage('Invalid Application Name'),
  body('email').optional({checkFalsy:true})
    .isEmail().withMessage('Invalid Email Address'),
  body('owner')
    .matches(/^[a-zA-Z]{1}[a-zA-Z0-9_-]*$/).withMessage('Invalid Owner Name'),
  body('clientId')
    .matches(/^[a-zA-Z]{1}[a-zA-Z0-9_-]*$/).withMessage('Invalid Client Id'),    
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }

	let appObj = req.body;
  Application.create({
    "name": appObj.name,
    "description": appObj.description,
    "email": appObj.email,
    "owner": appObj.owner,
    "applicationType": appObj.applicationType,
    "clientId": appObj.clientId
  }).then((result) => {
  	res.json({"result":"success"});
  }).catch(function(err) {
     console.log("error occured: "+err);
  });
  
});

router.put('/', [
  body('name')
    .matches(/^[a-zA-Z]{1}[a-zA-Z0-9_-]*$/).withMessage('Invalid Application Name'),
  body('email').optional({checkFalsy:true})
    .isEmail().withMessage('Invalid Email Address'),
  body('owner')
    .matches(/^[a-zA-Z]{1}[a-zA-Z0-9_-]*$/).withMessage('Invalid Owner Name'),
  body('clientId')
    .matches(/^[a-zA-Z]{1}[a-zA-Z0-9_-]*$/).withMessage('Invalid Client Id'),    
], (req, res) => {
  const errors = validationResult(req).formatWith(errorFormatter);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }

	let appObj = req.body;
	console.log(appObj);
  Application.update({ 
  	"name": appObj.name,
	  "description": appObj.description,
	  "email": appObj.email,
	  "owner": appObj.owner,
    "applicationType": appObj.applicationType,
    "clientId": appObj.clientId
	}, {where:{id:appObj.id}}).then(async (application) => {  	
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