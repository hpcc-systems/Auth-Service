'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
       queryInterface.addColumn(
        'Roles',
        'applicationType', Sequelize.STRING, {
           after: 'name'
        }
      ),
      queryInterface.addColumn(
        'Roles',
        'managedBy', Sequelize.STRING, {
           after: 'name'
        }
      ),
      queryInterface.addColumn(
        'Roles',
        'deletedAt', Sequelize.DATE, {
           after: 'name'
        }
      ),
      queryInterface.changeColumn('Roles', 'permissions', {
        type: Sequelize.JSON
      }),
      queryInterface.changeColumn('Roles', 'id', {
        type: Sequelize.UUID
      }),
      queryInterface.removeColumn('Roles','applicationId')
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('Roles','applicationType'),
      queryInterface.removeColumn('Roles','managedBy'),
      queryInterface.addColumn(
        'Roles',
        'applicationId', Sequelize.INTEGER, {
           after: 'name'
        }
      ),
      queryInterface.changeColumn('Roles', 'permissions', {
        type: Sequelize.TEXT
      }),      
    ]);
  }
};