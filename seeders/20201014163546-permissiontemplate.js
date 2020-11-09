'use strict';
var uuidv4  = require('uuid/v4');

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('PermissionTemplate', [{
    "id": uuidv4(),    
    "applicationType": "HPCC",
    "permissions": JSON.stringify([
  {
    "Cluster": [
      {
        "key": "SmcAccess",
        "name": "ECL Watch",
        "ui_values": [
          {
            "value": "Default",
            "description": ""
          },
          {
            "value": "Deny",
            "description": "",
            "default": true
          },
          {
            "value": "Read",
            "description": ""
          }
        ],
        "field_type": "radio",
        "description": "Allow user to Read ECL Watch page. In the HPCC Systems Admin document this feature is referred as SMCAccess"
      },
      {
        "key": "ClusterTopologyAccess",
        "name": "Topology",
        "ui_values": [
          {
            "value": "Default",
            "description": ""
          },
          {
            "value": "Deny",
            "description": "",
            "default": true
          },
          {
            "value": "Topo",
            "description": "Read cluster topology"
          },
          {
            "value": "Logs",
            "description": "Read process logs"
          }
        ],
        "field_type": "radio",
        "description": "Allow user to Read cluster properties. Topo will let user to Read cluster topology. Logs will give full access to user including Topo access"
      },
      {
        "key": "MachineInfoAccess",
        "name": "Machine info",
        "ui_values": [
          {
            "value": "Default",
            "description": ""
          },
          {
            "value": "Deny",
            "description": "",
            "default": true
          },
          {
            "value": "Read",
            "description": "Access machine/preflight info"
          }
        ],
        "field_type": "radio",
        "description": "Allow user to have access to machine/preflight information"
      },
      {
        "key": "DfuExceptions",
        "name": "Dfu_Exceptions",
        "ui_values": [
          {
            "value": "Default",
            "description": ""
          },
          {
            "value": "Deny",
            "description": "",
            "default": true
          },
          {
            "value": "Read",
            "description": "Read DFU exceptions"
          }
        ],
        "field_type": "radio",
        "description": "Allow user to view Device Firmware Update exceptions"
      },
      {
        "key": "WsStoreAccess",
        "name": "Ws_Store",
        "ui_values": [
          {
            "value": "Default",
            "description": ""
          },
          {
            "value": "Deny",
            "description": "",
            "default": true
          },
          {
            "value": "Read",
            "description": "List stores"
          },
          {
            "value": "Write",
            "description": "Update key/value pairs in stores"
          },
          {
            "value": "Full",
            "description": "Delete keys, delete namespaces, fetch metadata, create stores"
          }
        ],
        "field_type": "radio",
        "description": ""
      }
    ]
  },
  {
    "Roxie": [
      {
        "key": "PackageMapAccess",
        "name": "Package Map",
        "ui_values": [
          {
            "value": "Default",
            "description": ""
          },
          {
            "value": "Deny",
            "description": "",
            "default": true
          },
          {
            "value": "Read",
            "description": "Access to ListPackage, ListPackages, GetPackage, GetPackageMapById, ValidatePackage, GetQueryFileMapping, GetPackageMapSelectOptions,GetPartFromPackageMap"
          },
          {
            "value": "Write",
            "description": "Access to AddPackage, CopyPackageMap, ActivatePackage, DeActivatePackage, AddPartToPackageMap, RemovePartFromPackageMap"
          },
          {
            "value": "Full",
            "description": "Access to DeletePackage"
          }
        ],
        "field_type": "radio",
        "description": ""
      },
      {
        "key": "MetricsAccess",
        "name": "Metrics",
        "ui_values": [
          {
            "value": "Default",
            "description": ""
          },
          {
            "value": "Deny",
            "description": "",
            "default": true
          },
          {
            "value": "Read",
            "description": "Read ROXIE metrics"
          }
        ],
        "field_type": "radio",
        "description": "View ROXIE metr"
      },
      {
        "key": "RoxieControlAccess",
        "name": "Control",
        "ui_values": [
          {
            "value": "Default",
            "description": ""
          },
          {
            "value": "Deny",
            "description": "",
            "default": true
          },
          {
            "value": "Control",
            "description": "Access ROXIE control commands"
          }
        ],
        "field_type": "radio",
        "description": ""
      }
    ]
  },
  {
    "Workunit": [
      {
        "key": "OwnWorkunitsAccess",
        "name": "Own",
        "ui_values": [
          {
            "value": "Default",
            "description": ""
          },
          {
            "value": "Deny",
            "description": "",
            "default": true
          },
          {
            "value": "Read",
            "description": "Read workunits"
          },
          {
            "value": "Create",
            "description": "Create, modify, resubmit, abort workunits"
          },
          {
            "value": "Delete",
            "description": "Delete workunits"
          }
        ],
        "field_type": "radio",
        "description": ""
      },
      {
        "key": "OthersWorkunitsAccess",
        "name": "Others",
        "ui_values": [
          {
            "value": "Default",
            "description": ""
          },
          {
            "value": "Deny",
            "description": "",
            "default": true
          },
          {
            "value": "Read",
            "description": "Read ROXIE metrics"
          },
          {
            "value": "Modify",
            "description": "Modify, resubmit, abort workunits"
          },
          {
            "value": "Delete",
            "description": "Delete workunits"
          }
        ],
        "field_type": "radio",
        "description": ""
      },
      {
        "key": "AllowWorkunitScopeRead",
        "name": "Allow-Read",
        "field_type": "text",
        "description": "User has Read rights to workunit scope; virtual JSON key"
      },
      {
        "key": "AllowWorkunitScopeModify",
        "name": "Allow-modify",
        "field_type": "text",
        "description": "User has modify rights to workunit scope; virtual JSON key"
      },
      {
        "key": "AllowWorkunitScopeDelete",
        "name": "Allow-delete",
        "field_type": "text",
        "description": "User has delete rights to workunit scope; virtual JSON key"
      },
      {
        "key": "DenyWorkunitScopeRead",
        "name": "Deny-Read",
        "field_type": "text",
        "description": "User does not have Read rights to workunit scope"
      },
      {
        "key": "DenyWorkunitScopeModify",
        "name": "Deny-Modify",
        "field_type": "text",
        "description": "User does not have modify rights to workunit scope"
      },
      {
        "key": "DenyWorkunitScopeDelete",
        "name": "Deny-delete",
        "field_type": "text",
        "description": "User does not have delete rights to workunit scope"
      },
      {
        "key": "ThorQueueAccess",
        "name": "Thor_Queue",
        "ui_values": [
          {
            "value": "Default",
            "description": ""
          },
          {
            "value": "Deny",
            "description": "",
            "default": true
          },
          {
            "value": "Control",
            "description": "Promote/demote queued workunits; pause queue; clear queue; Read Thor usage stats"
          }
        ],
        "field_type": "radio",
        "description": "User does not have delete rights to workunit scope"
      },
      {
        "key": "DfuWorkunitsAccess",
        "name": "dfu",
        "ui_values": [
          {
            "value": "Default",
            "description": ""
          },
          {
            "value": "Deny",
            "description": "",
            "default": true
          },
          {
            "value": "Read",
            "description": "Read DFU workunits"
          },
          {
            "value": "Create",
            "description": "Create, delete, update, submit, abort DFU workunits"
          }
        ],
        "field_type": "radio",
        "description": "User does not have delete rights to workunit scope"
      },
      {
        "key": "WsEclAccess",
        "name": "ecl",
        "ui_values": [
          {
            "value": "Default",
            "description": ""
          },
          {
            "value": "Deny",
            "description": "",
            "default": true
          },
          {
            "value": "Create",
            "description": "Access the WsECL service"
          }
        ],
        "field_type": "radio",
        "description": "User does not have delete rights to workunit scope"
      }
    ]
  },
  {
    "File": [
      {
        "key": "AllowFileScopeAccess",
        "name": "Allow_access",
        "field_type": "text",
        "description": "User has access rights to scope; virtual JSON key"
      },
      {
        "key": "AllowFileScopeRead",
        "name": "Allow_read",
        "field_type": "text",
        "description": "User has read rights to scope; virtual JSON key"
      },
      {
        "key": "AllowFileScopeWrite",
        "name": "Allow_write",
        "field_type": "text",
        "description": "User has write rights to scope; virtual JSON key"
      },
      {
        "key": "AllowFileScopeFull",
        "name": "Allow_full",
        "field_type": "text",
        "description": "User has full rights to scope; virtual JSON key"
      },
      {
        "key": "DenyFileScopeAccess",
        "name": "Deny_Access",
        "field_type": "text",
        "description": "User does not have access rights to scope; virtual JSON key"
      },
      {
        "key": "DenyFileScopeRead",
        "name": "Deny_Read",
        "field_type": "text",
        "description": "User has read rights to scope; virtual JSON key"
      },
      {
        "key": "DenyFileScopeWrite",
        "name": "Deny_Write",
        "field_type": "text",
        "description": "User does not have write rights to scope; virtual JSON key"
      },
      {
        "key": "DenyFileScopeFull",
        "name": "Deny_Full",
        "field_type": "text",
        "description": "User does not have full rights to scope; virtual JSON key"
      },
      {
        "key": "DfuAccess",
        "name": "Management",
        "ui_values": [
          {
            "value": "Default",
            "description": ""
          },
          {
            "value": "Deny",
            "description": "",
            "default": true
          },
          {
            "value": "Read",
            "description": "Read DFU logical files"
          },
          {
            "value": "Create",
            "description": "Create, delete, superfile management"
          },
          {
            "value": "Delete_history",
            "description": "Erase file history metadata"
          }
        ],
        "field_type": "radio",
        "description": "DFU Access"
      },
      {
        "key": "FileIOAccess",
        "name": "Drop_Zone",
        "ui_values": [
          {
            "value": "Default",
            "description": ""
          },
          {
            "value": "Deny",
            "description": "",
            "default": true
          },
          {
            "value": "Read",
            "description": "Read files in Drop Zone"
          },
          {
            "value": "Write",
            "description": "Write files to Drop Zone"
          }
        ],
        "field_type": "radio",
        "description": "DFU Access"
      },
      {
        "key": "FileDesprayAccess",
        "name": "Despray",
        "ui_values": [
          {
            "value": "Default",
            "description": ""
          },
          {
            "value": "Deny",
            "description": "",
            "default": true
          },
          {
            "value": "Allow",
            "description": "Despray logical files"
          }
        ],
        "field_type": "radio",
        "description": "DFU Access"
      },
      {
        "key": "DfuXrefAccess",
        "name": "Xref",
        "ui_values": [
          {
            "value": "Default",
            "description": ""
          },
          {
            "value": "Deny",
            "description": "",
            "default": true
          },
          {
            "value": "Read",
            "description": "Access DFU XREF"
          },
          {
            "value": "Clean",
            "description": "Clean directory"
          },
          {
            "value": "Repair",
            "description": "Make changes and generate reports"
          }
        ],
        "field_type": "radio",
        "description": "DFU XREF"
      }
    ]
  }
  ]),
    createdAt : new Date(),
    updatedAt : new Date()
  },
  {
    "id": uuidv4(),
    "applicationType": "Tombolo",
    "permissions": JSON.stringify([{
      "Files": [
        {
          "name": "Add Files",
          "description": "Add a file in Tombolo",
          "ui_values": [{
            "value": "Deny",
            "description": ""
          },{
            "value": "add",
            "description": "Read ECL Watch"
          }],
          "key": "AddFiles",
          "field_type": "radio"
        },
        {
          "name": "Edit Files",
          "description": "Edit a file in Tombolo",
          "ui_values": [{
            "value": "Deny",
            "description": ""
          },{
            "value": "edit",
            "description": "Read ECL Watch"
          }],
          "key": "EditFiles",
          "field_type": "radio"
        },
        {
          "name": "Delete Files",
          "description": "Delete a file in Tombolo",
          "ui_values": [{
            "value": "Deny",
            "description": ""
          },{
            "value": "delete",
            "description": "Can delete files"
          }],
          "key": "DeleteFiles",
          "field_type": "radio"
        }
      ]
    },
    {
      "Dataflow": [
        {
          "name": "Add Dataflow",
          "description": "Add a dataflow in Tombolo",
          "ui_values": [{
            "value": "Deny",
            "description": ""
          },{
            "value": "add",
            "description": "Add Dataflow"
          }],
          "key": "AddDataflow",
          "field_type": "radio"
        },
        {
          "name": "Edit Dataflow",
          "description": "Edit a dataflow in Tombolo",
          "ui_values": [{
            "value": "Deny",
            "description": ""
          },{
            "value": "edit",
            "description": "Read ECL Watch"
          }],
          "key": "EditDataflow",
          "field_type": "radio"
        },
        {
          "name": "Delete Dataflow",
          "description": "Delete a dataflow in Tombolo",
          "ui_values": [{
            "value": "Deny",
            "description": ""
          },{
            "value": "delete",
            "description": "Can delete dataflow"
          }],
          "key": "DeleteDataflow",
          "field_type": "radio"
        }
      ]
    },
    {
      "Dataflow Instances": [
        {
          "name": "Read Dataflow Instance",
          "description": "Read a dataflow instance in Tombolo",
          "ui_values": [{
            "value": "Deny",
            "description": ""
          },{
            "value": "add",
            "description": "Read Dataflow Instance"
          }],
          "key": "ReadDataflowInstance",
          "field_type": "radio"
        }
      ]
    }]),
    createdAt : new Date(),
    updatedAt : new Date()
  },  

  ], {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('PermissionTemplate', null, {});
  }
};
