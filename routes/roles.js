var express = require('express');
var router = express.Router();
let models = require('../models');
let PermissionTemplate = models.PermissionTemplate;
let Role = models.Role;
const { body, query, check, validationResult, oneOf } = require('express-validator');
const errorFormatter = ({ location, msg, param, value, nestedErrors }) => {    
  return `${location}[${param}]: ${msg}`;
};

router.get('/permissions', function(req, res, next) {
  PermissionTemplate.findAll({where:{"applicationType": req.query.applicationType}}).then((result) => {  	  	
	  res.json(result);
  }).catch(function(err) {
     console.log("error occured: "+err);
  });
  
});

router.post('/', [
  body('name')
    .matches(/^[a-zA-Z0-9_ '~]*$/).withMessage('Invalid Role Name'),
  body('managedBy')
    .matches(/^[a-zA-Z0-9_ '~]*$/).withMessage('Invalid Managed By')    
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }
	let roleObj = req.body;
  Role.create({
    "name": roleObj.name,
    "managedBy": roleObj.managedBy,
    "description": roleObj.description,
    "applicationType": roleObj.applicationType,
    "permissions": roleObj.permissions
  }).then((result) => {
  	res.json({"result":"success"});
  }).catch(function(err) {
     console.log("error occured: "+err);
  });  
});

router.put('/', [
  body('name')
    .matches(/^[a-zA-Z0-9_ '~]*$/).withMessage('Invalid Role Name'),
  body('managedBy')
    .matches(/^[a-zA-Z0-9_ '~]*$/).withMessage('Invalid Managed By')    
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }
	let roleObj = req.body;	
  Role.update({ 
  	"name": roleObj.name,
	  "description": roleObj.description,
	  "managedBy": roleObj.roleObj,
    "applicationType": roleObj.applicationType,
    "permissions": roleObj.permissions
	}, {where:{id:roleObj.id}}).then(async (role) => {  	
  	res.json({"result":"success"});	  
  }).catch(function(err) {
     console.log("error occured: "+err);
  });  
});

router.get('/all', function(req, res, next) {
  Role.findAll({order: [['createdAt', 'DESC']]}).then((result) => {  	  	
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
	let roleId = req.query.id;
  Role.findOne({where:{"id":roleId}}).then((result) => {  	  	
	  res.json(result);
  }).catch(function(err) {
     console.log("error occured: "+err);
  });
});

router.get('/applicationType', [
  query('type').matches(/^[a-zA-Z]{1}[a-zA-Z0-9 _-]*$/).withMessage('Invalid Application Type')
], (req, res) => {
  const errors = validationResult(req).formatWith(errorFormatter);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  } 
  let appType = req.query.type;
  Role.findOne({where:{"id":roleId}}).then((result) => {        
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
  let roleId = req.query.id;
  Role.destroy({where:{"id":roleId}}).then((role) => {        
    res.json({"result":"success"});    
  }).catch(function(err) {
     console.log("error occured: "+err);
  });      
});


module.exports = router;