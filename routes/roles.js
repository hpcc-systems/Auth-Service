var express = require('express');
var router = express.Router();
let models = require('../models');
let PermissionTemplate = models.PermissionTemplate;
let Role = models.Role;

router.get('/permissions', function(req, res, next) {
  PermissionTemplate.findAll({where:{"applicationType": req.query.applicationType}}).then((result) => {  	  	
	  res.json(result);
  }).catch(function(err) {
     console.log("error occured: "+err);
  });
  
});

router.post('/', function(req, res, next) {
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

router.put('/', function(req, res, next) {
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

router.get('/', function(req, res, next) {
	let roleId = req.query.id;
  Role.findOne({where:{"id":roleId}}).then((result) => {  	  	
	  res.json(result);
  }).catch(function(err) {
     console.log("error occured: "+err);
  });
});

router.delete('/', function(req, res, next) {
  let roleId = req.query.id;
  Role.destroy({where:{"id":roleId}}).then((role) => {        
    res.json({"result":"success"});    
  }).catch(function(err) {
     console.log("error occured: "+err);
  });      
});


module.exports = router;