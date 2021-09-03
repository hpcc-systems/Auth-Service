"use strict";
const uuidv4 = require("uuid/v4");

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.sequelize.query(
        'select * from Roles where name="Tombolo_Admin" and applicationType="Tombolo" and deletedAt is null', {
        type: queryInterface.sequelize.QueryTypes.SELECT
      }).then(roles => {
        if(!roles || roles.length == 0) {          
          return queryInterface.bulkInsert("Roles", [
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
                "View PII": "allow"
              }),
            }            
          ]);
        }
      }),
      queryInterface.sequelize.query(
        'select * from Roles where name="Creator" and applicationType="Tombolo" and deletedAt is null', {
        type: queryInterface.sequelize.QueryTypes.SELECT
      }).then(roles => {
        if(!roles || roles.length == 0) {
          return queryInterface.bulkInsert("Roles", [{
            id: uuidv4(),
            applicationType: "Tombolo",
            name: "Creator",
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
              ReadDataflowInstance: "add"
            })
          }]);         
        }    
      })
    ])    
  },

  down: (queryInterface, Sequelize) => {
  	const Op = Sequelize.Op;
    return queryInterface.bulkDelete("Roles", {"applicationType":"Tombolo", [Op.or]: [{"name": "Tombolo_Admin"}, {"name": "Creator"}]}, {});
  },
};
