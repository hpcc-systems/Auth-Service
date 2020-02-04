'use strict';
module.exports = (sequelize, DataTypes) => {
  const User_Role = sequelize.define('User_Roles', {
    userId: DataTypes.INTEGER,
    roleId: DataTypes.INTEGER,
    permissions: DataTypes.TEXT
  }, {});
  return User_Role;
};