'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('user_roles', [{
      userId : 1,
      roleId : 1,
      permissions: '1,2,3,4,5,6,7,8',
      createdAt : new Date(),
      updatedAt : new Date()
    }], {});
  },

  down: (queryInterface, Sequelize) => {    
  }
};
