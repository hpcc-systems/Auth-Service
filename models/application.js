'use strict';
module.exports = (sequelize, DataTypes) => {
  const Application = sequelize.define(
    "Application",
    {
      id: {
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        autoIncrement: false,
      },
      name: DataTypes.STRING,
      description: DataTypes.STRING,
      email: DataTypes.STRING,
      owner: DataTypes.STRING,
      tokenTtl: {
        type: DataTypes.SMALLINT,
        allowNull: true,
      },
      registrationConfirmationRequired: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      applicationType: DataTypes.STRING,
      clientId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    { paranoid: true, freezeTableName: true }
  );
  Application.associate = function(models) {
    models.Application.belongsToMany(models.User, { through: 'User_Roles', foreignKey: 'applicationId'});    
  } 
  return Application;
};