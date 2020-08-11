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
	let appObj = req.body, roleUpdatePromises=[];
	console.log(appObj);
  Application.create(appObj).then((result) => {
  	console.log(result.get('id'))  	
  	if(appObj.roles) {  		
  		appObj.roles.forEach(async (role) => {
  			if(role.id != '') {
  				Role.findOne({where: {"id":role.id}}).then((role) => {
		  			roleUpdatePromises.push(Role.update({
		  				permissions: JSON.stringify(role.permissions)
		  			}, {where:{id:role.id}}))
					})
  			} else {
  				roleUpdatePromises.push(Role.create({
		  			'name':role.name,
		  			'applicationId': result.get('id'),
		  			'permissions': JSON.stringify(role.permissions)
		  		}))
  			}
  		})
  		Promise.all(roleUpdatePromises).then(() => {
        res.json({"result":"success"});	         
      });
  	}	  
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
	  "owner": appObj.owner
	}, {where:{id:appObj.id}}).then(async (application) => {  	
  	if(appObj.roles) {
  		let roleUpdatePromises = [];
  		appObj.roles.forEach((appRole) => {
  			let roleName = Object.keys(appRole)[0];
  			if(appRole.id != '') {
		  		Role.findOne({where: {"id":appRole.id}}).then((role) => {
		  			roleUpdatePromises.push(Role.update({
		  				permissions: JSON.stringify(appRole.permissions)
		  			}, {where:{id:role.id}}))
					})
		  	} else {
	  		  roleUpdatePromises.push(Role.create({
		  			'name':roleName,
		  			'applicationId': appObj.id,
		  			'permissions': JSON.stringify(appRole.permissions)
		  		}))
		  	}
	  	});

	  	Promise.all(roleUpdatePromises).then(() => {
        res.json({"result":"success"});	         
      });
  	//new
  	} else if(appObj.role) {
  		Role.create({
  			'name':appObj.role.name,
  			'applicationId': appObj.id,
  			'permissions': JSON.stringify(appObj.permissions)
  		}).then((roleCreated) => {
  			res.json({"result":"success"});	
  		})
  	} else {
  		//role not present in the request object as user did not select role
  		res.json({"result":"success"});	
  	}	
	  
  }).catch(function(err) {
     console.log("error occured: "+err);
  });
  
});

router.get('/all', function(req, res, next) {
  Application.findAll({include:[{model: models.Role, include: [models.Permission] }]}).then((result) => {  	
  	
	  res.json(result);
  }).catch(function(err) {
     console.log("error occured: "+err);
  });
  
});

router.get('/', function(req, res, next) {
	let appId = req.query.id;
  Application.findOne({where:{"id":appId}, include:[{model: models.Role, include: [models.Permission] }]}).then((result) => {  	
  	
	  res.json(result);
  }).catch(function(err) {
     console.log("error occured: "+err);
  });
});

router.get('/details', function(req, res, next) {
	let appId = req.query.id, results={};
  Application.findOne({where:{"id":appId}, include:[models.Role]}).then((application) => {  	
  	results.application = application;
  	AppPermissions.findAll({where:{applicationType:application.applicationType}, attributes:{ exclude: ["createdAt", "updatedAt"]}}).then((applicationPermissions) => {
  		results.permissions = applicationPermissions;
  		res.json(results);
  	})	  
  }).catch(function(err) {
     console.log("error occured: "+err);
  });
});

router.get('/app-permissions', function(req, res, next) {
	let results={};
	AppPermissions.findAll({where:{applicationType:req.query.type}, attributes:{ exclude: ["createdAt", "updatedAt"]}}).then((applicationPermissions) => {
		res.json(applicationPermissions);  	
  }).catch(function(err) {
     console.log("error occured: "+err);
  });
});

router.delete('/', function(req, res, next) {
	let appId = req.query.id;
  Application.destroy({where:{"id":appId}, include:[{model: models.Role, include: [models.Permission] }]}).then((application) => {  	
  	Role.findAll({where: {"applicationId":appId}}).then((roles) => {
  		let roleIds = [];
  		roles.forEach((role) => {  			
  			roleIds.push(role.id);
  		})
  		Permission.destroy({where:{"roleId": {[Op.in]: roleIds}}}).then((permissions)	=> {
		  	Role.destroy({where: {"applicationId":appId}}).then((roleDestroyed) => {
		  		res.json(application);
		  	});
  		})
  	})	  
  }).catch(function(err) {
     console.log("error occured: "+err);
  });	    
});

module.exports = router;