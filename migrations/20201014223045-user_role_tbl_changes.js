'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn(
        'User_Roles',
        'applicationId', Sequelize.UUID, {
           after: 'name'
        }
      ),
      queryInterface.addColumn(
        'User_Roles',
        'deletedAt', Sequelize.DATE, {
           after: 'name'
        }
      ),      
      queryInterface.addColumn(
        'User_Roles',
        'priority', Sequelize.INTEGER, {
           after: 'name'
        }
      ),      
      queryInterface.changeColumn('User_Roles', 'roleId', {
        type: Sequelize.UUID
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('User_Roles','applicationId'),
      queryInterface.removeColumn('User_Roles','deletedAt')      
    ]);
  }
};