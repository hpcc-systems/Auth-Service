'use strict';
module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define('Role', {
    id: {
		  type: DataTypes.INTEGER,
		  primaryKey: true,
      autoIncrement: true
    },
    name: DataTypes.STRING,
    applicationId: DataTypes.INTEGER
  }, {});
  Role.associate = function(models) {
    //models.Role.belongsToMany(models.User, { through: 'User_Roles', foreignKey: 'roleId'});
    models.Role.hasMany(models.Permission);
    models.Role.belongsTo(models.Application);
  };
  return Role;
};