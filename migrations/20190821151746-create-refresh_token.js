'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Refreshtokens', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
      client_id: {
        type: Sequelize.STRING
      },
      username: {
        type: Sequelize.STRING
      },
      token: {
        type: Sequelize.STRING
      },
      last_accessed: {
        type: Sequelize.DATE
      },
      revoked: {
        type: Sequelize.BOOLEAN
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('RefreshTokens');
  }
};