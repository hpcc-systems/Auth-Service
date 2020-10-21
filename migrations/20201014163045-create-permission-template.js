'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('PermissionTemplate', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },   
      applicationType: {
        type: Sequelize.STRING
      },
      permissions: {
        type: Sequelize.JSON
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      deletedAt: {
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('PermissionTemplate');
  }
};