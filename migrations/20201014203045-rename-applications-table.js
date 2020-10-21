'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
    queryInterface.renameTable('Applications', 'Application'),
  ])
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.renameTable('Application', 'Applications'),
    ])
  }
};