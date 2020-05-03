var express = require('express');
var router = express.Router();
const bcrypt = require('bcryptjs');
let models = require('../models');
let Role = models.Role;
let Permission = models.Permission;
let Application = models.Application;

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
	    where: {name: permission, roleId: roleId},
	    defaults: {
	      "name": permission,
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
  Application.update({ 
  	"name": appObj.name,
	  "description": appObj.description,
	  "email": appObj.email,
	  "owner": appObj.owner
	}, {where:{id:appObj.id}}).then(async (application) => {  	
  	if(appObj.Roles) {
  		appObj.Roles.forEach(async (role) => {
  			//add only new rules and permissions
  			console.log('role.id: '+role.id);
  			if(!role.id) {
  				console.log(application);
	  			let createRoleResult = await findOrCreateRole(role, appObj.id);
  				console.log('roleid: '+createRoleResult[0].id);
	  			if(role.Permissions) {
			  		role.Permissions.forEach( async (permission) => {
			  			let createPermissionResult = await findOrCreatePermission(permission, createRoleResult[0].id);
			  		})
			  	}
			  } else {
			  	//only new permissions added
			  	if(role.Permissions) {
			  		role.Permissions.forEach( async (permission) => {
			  			if(!permission.id) {
			  				let createPermissionResult = await findOrCreatePermission(permission, role.id);
			  			}
			  		})
			  	}
			  }
  		})  		
  	}

  	if(appObj.roles_removed) {
  		appObj.roles_removed.forEach(async (removedRoles) => {
  			let rolesRemovedResult = await removeRoles(removedRoles, appObj.id)
  		});
  	}

  	if(appObj.permissions_removed) {
  		appObj.permissions_removed.forEach(async (removedPermission) => {
  			let permissionsRemovedResult = await removePermissions(removedPermission.id, removedPermission.roleId)	
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

module.exports = router;