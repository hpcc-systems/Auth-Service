'use strict';
module.exports = (sequelize, DataTypes) => {
  const PermissionTemplate = sequelize.define('PermissionTemplate', {
    id: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      autoIncrement: false
    },
    applicationType: DataTypes.STRING,
    permissions: DataTypes.JSON
  }, {paranoid: true, freezeTableName: true});
  PermissionTemplate.associate = function(models) {
    // associations can be defined here
  };
  return PermissionTemplate;
};