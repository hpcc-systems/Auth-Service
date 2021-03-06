"use strict";
require("dotenv").config();
const uuidv4 = require("uuid/v4");

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert("Application", [
      {
        id: uuidv4(),
        name: "Tombolo",
        description: "Tombolo application",
        email: process.env.EMAIL,
        owner: process.env.OWNER,
        clientId: process.env.TOMBOLO_CLIENT_ID,
        CreatedAt: new Date(),
        updatedAt: new Date(),
        applicationType: "Tombolo",
      },
    ]);
  },

  down: (queryInterface, Sequelize) => {
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete("Application", {"name":"Tombolo"}, {});
  },
};
