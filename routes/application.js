var express = require('express');
var router = express.Router();
const bcrypt = require('bcryptjs');
let models = require('../models');
let Role = models.Role;
let Permission = models.Permission;
let Application = models.Application;
let Sequelize = require('sequelize');
const Op = Sequelize.Op;

let findOrCreateRole = async (role, applicationId) => {
	return new Promise((resolve, reject) => {	
		Role.findOrCreate({
	    where: {name: role.name, applicationId: applicationId},
	    defaults: {
	      "name": role.name,
	      "applicationId": applicationId
	    }
	  }).then(function(result) {
	  	//update
	  	if(!result[1]) {
	  		console.log('role already exists')
	  	}
	  	resolve(result)
	  }).catch(function(err) {
     console.log("could not create roles: "+err);
     reject(err);
  	});
	});
}

let findOrCreatePermission = async (permission, roleId) => {
	return new Promise((resolve, reject) => {	
		Permission.findOrCreate({
	    where: {name: permission.name, roleId: roleId},
	    defaults: {
	      "name": permission.name,
	      "roleId": roleId
	    }
	  }).then(function(result) {
	  	//update
	  	if(!result[1]) {
	  		console.log('permission already exists')
	  	}
	  	resolve(result)
	  }).catch(function(err) {
     console.log("could not create permissions: "+err);
     reject(err);
  	});
	});
}

let removeRoles = async(roleId, applicationId) => {
	return new Promise((resolve, reject) => {	
		Role.destroy({
	    where: {id: roleId, applicationId: applicationId}, 
	    include: [models.Permission]
	  }).then(function(result) {
	  	resolve(result)
	  }).catch(function(err) {
     console.log("could not remove roles: "+err);
     reject(err);
  	});
	});
}

let deleteAppRolesAndPermissions = (appId) => {
	return new Promise((resolve, reject) => {
		Role.findAll({where: {"applicationId":appId}}).then((roles) => {
			let roleIds = [];
			roles.forEach((role) => {  			
				roleIds.push(role.id);
			})
			Permission.destroy({where:{"roleId": {[Op.in]: roleIds}}}).then((permissions)	=> {
		  	Role.destroy({where: {"applicationId":appId}}).then((roleDestroyed) => {
		  		resolve(roleDestroyed);
		  	});
			})
		})
	})
}

let removePermissions = async(permissionId, roleId) => {
	return new Promise((resolve, reject) => {	
		Permission.destroy({
	    where: {id: permissionId, roleId: roleId}
	  }).then(function(result) {
	  	resolve(result)
	  }).catch(function(err) {
     console.log("could not remove permissions: "+err);
     reject(err);
  	});
	});
}

router.post('/', function(req, res, next) {
	let appObj = req.body;
	console.log(appObj);
  Application.create(appObj).then((result) => {
  	console.log(result.get('id'))  	
  	if(appObj.roles) {  		
  		appObj.roles.forEach(async (role) => {
  			let createRoleResult = await findOrCreateRole(role, result.get('id'));
  			console.log('roleid: '+createRoleResult[0].id);
  			if(role.permissions) {
		  		role.permissions.forEach( async (permission) => {
		  			let createPermissionResult = await findOrCreatePermission(permission, createRoleResult[0].id);
		  		})
		  	}
  		})
  		
  	}
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
	  "owner": appObj.owner
	}, {where:{id:appObj.id}}).then(async (application) => {  	
  	if(appObj.roles) {
  		console.log('roles');
  		//delete and recreate roles & permissions
  		deleteAppRolesAndPermissions(appObj.id).then((rolesPermissionDeleted) => {
	  		appObj.roles.forEach(async (role) => {
	  			let createRoleResult = await findOrCreateRole(role, appObj.id);
	  			console.log('role.id: '+createRoleResult[0].id);
			  	if(role.permissions) {
			  		role.permissions.forEach( async (permission) => {
			  			if(!permission.id) {
			  				let createPermissionResult = await findOrCreatePermission(permission, createRoleResult[0].id);
			  			}
			  		})
			  	}
	  		})  		
	  	})
  	}  	

	  res.json({"result":"success"});
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