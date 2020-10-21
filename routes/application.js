var express = require('express');
var router = express.Router();
const bcrypt = require('bcryptjs');
let models = require('../models');
let Role = models.Role;
let Permission = models.Permission;
let Application = models.Application;
let AppPermissions = models.App_Permissions;
let Sequelize = require('sequelize');
const Op = Sequelize.Op;

router.post('/', function(req, res, next) {
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

router.put('/', function(req, res, next) {
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

router.get('/', function(req, res, next) {
	let appId = req.query.id;
  Application.findOne({where:{"id":appId}}).then((result) => {  	  	
	  res.json(result);
  }).catch(function(err) {
     console.log("error occured: "+err);
  });
});

router.delete('/', function(req, res, next) {
  let appId = req.query.id;
  Application.destroy({where:{"id":appId}}).then((application) => {        
    res.json({"result":"success"});    
  }).catch(function(err) {
     console.log("error occured: "+err);
  });      
});

module.exports = router;