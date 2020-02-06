'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      'User_Roles',
      {
        userId: {
          type: Sequelize.INTEGER,
          primaryKey: true
        },
        roleId: {
          type: Sequelize.INTEGER,
          primaryKey: true
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
        }
      }
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('User_Roles');
  }
};
