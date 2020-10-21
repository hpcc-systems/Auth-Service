'use strict';
module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define('Role', {
    id: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      autoIncrement: false
    },
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    applicationType: DataTypes.STRING,
    managedBy: DataTypes.STRING,
    permissions: DataTypes.JSON
  }, {paranoid: true});
  Role.associate = function(models) {
    models.Role.belongsToMany(models.User, { through: 'User_Roles', foreignKey: 'roleId'});    
    //models.Role.hasMany(models.Permission);
    //models.Role.belongsTo(models.Application);
  };
  return Role;
};