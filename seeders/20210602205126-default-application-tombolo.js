"use strict";
const uuidv4 = require("uuid/v4");

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert("application", [
      {
        id: uuidv4(),
        name: "Tombolo",
        description: "Add Description Here",
        email: " your email here",
        owner: "Owner Name",
        clientId: "ClientID",
        CreatedAt: new Date(),
        updatedAt: new Date(),
        applicationType: "Tombolo",
      },
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("roles", null, {});
  },
};
