'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
     queryInterface.addColumn(
      'Application',
      'deletedAt', Sequelize.DATE, {
         after: 'application_id'
      }
    ),
    queryInterface.addColumn(
      'Application',
      'clientId', Sequelize.STRING, {
         after: 'application_id'
      }
     )
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('Application','deletedAt'),
      queryInterface.removeColumn('Application','clientId')
    ]);
  }
};