'use strict';
var uuidv4  = require('uuid/v4');

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('PermissionTemplate', [{
      "id": uuidv4(),    
      "applicationType": "RealBI",
      "permissions": JSON.stringify([{
        "Dashboard": [
          {
            "name": "Add Dashboard",
            "description": "Add a Dashboard",
            "ui_values": [{
              "value": "Deny",
              "description": ""
            },{
              "value": "add",
              "description": "h"
            }],
            "key": "AddDashboard",
            "field_type": "radio"
          },
          {
            "name": "Edit Dashboard",
            "description": "Edit a dashboard in RealBI",
            "ui_values": [{
              "value": "Deny",
              "description": ""
            },{
              "value": "edit",
              "description": ""
            }],
            "key": "EditDashboard",
            "field_type": "radio"
          },
          {
            "name": "Delete Dashboard",
            "description": "Delete a dashboard in RealBI",
            "ui_values": [{
              "value": "Deny",
              "description": ""
            },{
              "value": "delete",
              "description": "Can delete dashboard"
            }],
            "key": "DeleteDashboard",
            "field_type": "radio"
          }
        ]
      }]),
      createdAt : new Date(),
      updatedAt : new Date()
    }])
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('PermissionTemplate', {"applicationType":"RealBI"}, {});
  }
};
