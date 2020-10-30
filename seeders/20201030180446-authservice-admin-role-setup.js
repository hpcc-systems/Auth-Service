'use strict';
var uuidv4  = require('uuid/v4');
let models = require('../models');
let User = models.User;

module.exports = {
   up: async(queryInterface, Sequelize) => {
    const user = await User.findOne({where:{username:'admin'}});
    const roleId = uuidv4(), applicationId = uuidv4();
    console.log(roleId);
    return Promise.all([
      queryInterface.bulkInsert('Application', [{
        id : applicationId,
        name : 'Auth Service',
        description: 'System Application for managing Auth Service',
        owner: 'LexisNexis',
        applicationType: 'AuthService',
        createdAt : new Date(),
        updatedAt : new Date()
      }]),

      queryInterface.bulkInsert('Roles', [{
        id : roleId,
        name : 'AuthService-Admin',
        description: 'System role for managing Auth Service',
        managedBy: 'LexisNexis',
        applicationType: 'AuthService',
        createdAt : new Date(),
        updatedAt : new Date()
      }], {}, {name:'AuthService-Admin'}),
      
      queryInterface.bulkInsert('User_Roles', [{
        userId : user.id,
        roleId : roleId,
        applicationId: applicationId,
        priority: 1,
        createdAt : new Date(),
        updatedAt : new Date()
      }], {}, {userId:user.id, roleId:roleId, applicationId:applicationId})
    ])    
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('People', null, {});
    */
  }
};
