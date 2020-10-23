var express = require('express');
var router = express.Router();
const bcrypt = require('bcryptjs');
let Sequelize = require('sequelize');
let models = require('../models');
let User = models.User;
let Role = models.Role;
let Permission = models.Permission;
let UserRoles = models.User_Roles;
const Op = Sequelize.Op;
const { body, query, check, validationResult } = require('express-validator');
const errorFormatter = ({ location, msg, param, value, nestedErrors }) => {    
  return `${location}[${param}]: ${msg}`;
};

/* GET users listing. */
router.get('/all', function(req, res, next) {
  	User.findAll({
  		attributes: { exclude: ["password", "createdAt", "updatedAt"] },
  		include:[{model: models.Role, attributes:{ exclude: ["createdAt", "updatedAt"]}}]
  	}).then(function(users) {
	    res.json(users);
	})
	.catch(function(err) {
	    console.log(err);
	});
});

router.get('/roles', function(req, res, next) {
  	Role.findAll().then(function(roles) {
	    res.json(roles);
	})
	.catch(function(err) {
	    console.log(err);
	});
});

router.get('/permissions', function(req, res, next) {
  Permission.findAll().then(function(permissions) {
      res.json(permissions);
  })
  .catch(function(err) {
      console.log(err);
  });
});


router.delete('/delete', (req, res) => {
  console.log("[delete/read.js] - delete job = " + req.query.id);
  User.destroy(
      {where:{"id": req.query.id}, include: [{model:Role}]}
  ).then(function(deleted) {
      UserRoles.destroy({where: {userId: req.query.id}}).then(function(deleted) {
      	res.json({"result":"success"});
      });
  }).catch(function(err) {
      console.log(err);
  });
});

router.post('/user', [
  body('firstName')
    .matches(/^[a-zA-Z]{1}[a-zA-Z0-9 _-]*$/).withMessage('Invalid First Name'),
  body('lastName').optional({checkFalsy:true})
    .matches(/^[a-zA-Z]{1}[a-zA-Z0-9 _-]*$/).withMessage('Invalid Last Name'),
  body('username')
    .matches(/^[a-zA-Z]{1}[a-zA-Z0-9_-]*$/).withMessage('Invalid User Name'),
  body('email').optional({checkFalsy:true})
    .isEmail().withMessage('Invalid Email Address'),
  body('organization').optional({checkFalsy:true})
    .matches(/^[a-zA-Z]{1}[a-zA-Z0-9_-]*$/).withMessage('Invalid Organization Name'),        
  body('password').optional({checkFalsy:true}).isLength({ min: 4 }),
  body('employeeId')
    .matches(/^[a-zA-Z0-9_.-]*$/).withMessage('Invalid Employee Id')
], (req, res) => {
  const errors = validationResult(req).formatWith(errorFormatter);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }
  var fieldsToUpdate={}, hash, promises = [];
  try {
  	if (req.body.password) {
        hash = bcrypt.hashSync(req.body.password, 10);
  	}
    User.findOrCreate({
      where: {username: req.body.username},
      defaults: {
      	"firstName": req.body.firstName,
  			"lastName": req.body.lastName,
  			"username": req.body.username,
  			"password": hash,
  			"email": req.body.email,
  			"organization": req.body.organization,
        "employeeId": req.body.employeeId,
        "type": req.body.type
      }
    }).then(async function(result) {
      let user = result[0];
      //update scenario
      if(!result[1]) {
        fieldsToUpdate = {
          "firstName"  : req.body.firstName, 
          "lastName" : req.body.lastName, 
          "password": hash, 
          "email" : req.body.email, 
          "organization" : req.body.organization,
          "employeeId" : req.body.employeeId,
          "type": req.body.type
        };
        User.update(fieldsToUpdate, {where:{username:req.body.username}}).then(function(updateResult){
        	return User.findOne({where: {username: req.body.username}, include: [{model:Role}]})
        }).then(function(user) {
        	
          //role changed?
          UserRoles.destroy({where:{userId:user.id}}).then();
          req.body.appRoles.forEach((appRole) => {
            promises.push(
              UserRoles.create({
                'userId': user.id,
                'roleId': appRole.roleId,
                'applicationId': appRole.appId,
                'priority': appRole.priority
              })
             )
          })

          Promise.all(promises).then(() => {
            console.log("user_roles updated....")   
            res.json({"result":"success"});            
          });
        });
      } else {
      	//new user
        req.body.appRoles.forEach((appRole) => {
          promises.push(
            UserRoles.create({
              'userId': user.id,
              'roleId': appRole.roleId,
              'applicationId': appRole.appId,
              'priority': appRole.priority
            })
           )
        })

        Promise.all(promises).then(() => {
          console.log("user_roles added....")   
          res.json({"result":"success"});            
        });
      }

    }), function(err) {
        return res.status(500).send(err);
    }
  } catch (err) {
      console.log('err', err);
  }
});

router.post('/changepwd', [
  body('username')
    .matches(/^[a-zA-Z]{1}[a-zA-Z0-9_-]*$/).withMessage('Invalid User Name'),       
  body('newpassword').isLength({ min: 4 }).withMessage('Invalid New Password'),
  body('confirmpassword').isLength({ min: 4 }).withMessage('Invalid Confirm New Password')    
], (req, res) => {
  const errors = validationResult(req).formatWith(errorFormatter);
  if (!errors.isEmpty()) {
    //return res.status(422).json({ success: false, errors: errors.array() });
    return res.status(422).send({ success: false, errors: errors.array() });
  }

	User.findOne({
    where: {
      username: req.body.username
    },
    include: [{model:Role}]
  }).then(user => {
    if (!user) {
      return res.status(500).send('User Not Found.');
    }

    var passwordIsValid = bcrypt.compareSync(req.body.oldpassword, user.password);
    if (!passwordIsValid) {
      return res.status(401).send({reason: "Invalid Password!" });
    }

    if(req.body.newpassword == req.body.confirmpassword) {
    	let updatedhash = bcrypt.hashSync(req.body.newpassword, 10);
    	User.update(
	    	{ password: updatedhash },
	    	{ where: {username:req.body.username}}
    	).then(function (updated) {
    		res.json({"result":"success"});
    	})
    } else {
    	return res.status(500).send({reason: 'Passwords does not match.'});
    }
 });

});

router.post('/signout', (req, res) => {
	res.clearCookie("auth");
    res.json({"result":"signedout"});
});

router.get('/details', function(req, res, next) {
  User.findOne({where:{
    "id": req.query.id
  }, 
  attributes: { exclude: ["password", "createdAt", "updatedAt"] }, 
  include:[{model: models.Role, attributes:{ exclude: ["createdAt", "updatedAt"]}}, {model: models.Application, attributes:{ exclude: ["createdAt", "updatedAt"]}}]}).then(function(user) {
    res.json(user);
  })
  .catch(function(err) {
      console.log(err);
  });
});

module.exports = router;
