'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn(
        'Users',
        'employeeId', Sequelize.STRING, {
           after: 'username'
        }
      ),
      queryInterface.addColumn(
        'Users',
        'deletedAt', Sequelize.DATE, {
           after: 'username'
        }
      ),      
      queryInterface.addColumn(
        'Users',
        'type', Sequelize.STRING, {
           after: 'username'
        }
      ),      
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('Users','employeeId'),
      queryInterface.removeColumn('Users','deletedAt'),
      queryInterface.removeColumn('Users','type')      
    ]);
  }
};