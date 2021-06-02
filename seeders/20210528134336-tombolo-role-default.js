"use strict";
const uuidv4 = require("uuid/v4");

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert("roles", [
      {
        id: uuidv4(),
        applicationType: "Tombolo",
        name: "Tombolo_Admin",
        managedBy: "LNRS",
        CreatedAt: new Date(),
        updatedAt: new Date(),
        permissions: JSON.stringify({
          AddFiles: "add",
          EditFiles: "edit",
          AddDataflow: "add",
          DeleteFiles: "delete",
          EditDataflow: "edit",
          DeleteDataflow: "delete",
          ReadDataflowInstance: "add",
        }),
      },
      {
        id: uuidv4(),
        applicationType: "Tombolo",
        name: "Tombolo_Creator",
        managedBy: "LNRS",
        CreatedAt: new Date(),
        updatedAt: new Date(),
        permissions: JSON.stringify({
          AddFiles: "add",
          EditFiles: "edit",
          AddDataflow: "add",
          DeleteFiles: "delete",
          EditDataflow: "edit",
          DeleteDataflow: "delete",
          ReadDataflowInstance: "add",
        }),
      },
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("roles", null, {});
  },
};
