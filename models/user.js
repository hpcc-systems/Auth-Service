'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    username: DataTypes.STRING,
    email: DataTypes.STRING,
    organization: DataTypes.STRING,
    password: DataTypes.STRING
  }, {});
  User.associate = function(models) {
    models.User.belongsToMany(models.Role, { through: 'User_Roles', foreignKey: 'userId', onDelete: 'CASCADE'});
    //models.User.belongsToMany(models.Role);
  };
  return User;
};