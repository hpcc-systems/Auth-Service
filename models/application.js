'use strict';
module.exports = (sequelize, DataTypes) => {
  const Application = sequelize.define('Application', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    email: DataTypes.STRING,
    owner: DataTypes.STRING
  }, {});
  Application.associate = function(models) {
    models.Application.hasMany(models.Role);
  };
  return Application;
};