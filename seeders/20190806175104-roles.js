'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Roles', [{
      id: 1,
      name : 'admin',
      createdAt : new Date(),
      updatedAt : new Date()
    }, {
      id: 2,
      name : 'user',
      createdAt : new Date(),
      updatedAt : new Date()
    }], {});
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
