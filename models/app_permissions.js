'use strict';
module.exports = (sequelize, DataTypes) => {
  const App_Permissions = sequelize.define('App_Permissions', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    applicationType: DataTypes.STRING,
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    applicationType: DataTypes.STRING,
    access: DataTypes.STRING
  }, {});
  App_Permissions.associate = function(models) {
    // associations can be defined here
  };
  return App_Permissions;
};