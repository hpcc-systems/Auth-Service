'use strict';
var uuidv4  = require('uuid/v4');

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('PermissionTemplate', [{
      "id": uuidv4(),    
      "applicationType": "RealBI",
      "permissions": JSON.stringify([]),
      createdAt : new Date(),
      updatedAt : new Date()
    }])
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('PermissionTemplate', {"applicationType":"RealBI"}, {});
  }
};
