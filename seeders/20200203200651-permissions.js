'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Permissions', [{
        id: 1,
        name: 'View PII',
        createdAt : new Date(),
        updatedAt : new Date()
      },
      {
        id: 2,
        name: 'Add Files',
        createdAt : new Date(),
        updatedAt : new Date()
      },
      {
        id: 3,
        name: 'Add Indexes',
        createdAt : new Date(),
        updatedAt : new Date()
      },
      {
        id: 4,
        name: 'Add Queries',
        createdAt : new Date(),
        updatedAt : new Date()
      },
      {
        id: 5,
        name: 'Add Jobs',
        createdAt : new Date(),
        updatedAt : new Date()
      },
      {
        id: 6,
        name: 'Edit Files',
        createdAt : new Date(),
        updatedAt : new Date()
      },
      {
        id: 7,
        name: 'Edit Indexes',
        createdAt : new Date(),
        updatedAt : new Date()
      },
      {
        id: 8,
        name: 'Edit Queries',
        createdAt : new Date(),
        updatedAt : new Date()
      },
      {
        id: 9,
        name: 'Edit Jobs',
        createdAt : new Date(),
        updatedAt : new Date()
      }], {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Permissions', null, {});
  }
};