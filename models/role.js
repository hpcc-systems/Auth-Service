'use strict';
module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define('Role', {
    id: {
		  type: DataTypes.INTEGER,
		  primaryKey: true
    },
    name: DataTypes.STRING
  }, {});
  Role.associate = function(models) {
    models.Role.belongsToMany(models.User, { through: 'User_Roles', foreignKey: 'roleId'});
  };
  return Role;
};