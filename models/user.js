'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      firstName: DataTypes.STRING,
      lastName: DataTypes.STRING,
      username: DataTypes.STRING,
      email: DataTypes.STRING,
      organization: DataTypes.STRING,
      password: DataTypes.STRING,
      accountVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      registrationConfirmationCode: DataTypes.UUID,
      employeeId: DataTypes.STRING,
      type: DataTypes.STRING,
      deletedAt: DataTypes.DATE,
    },
    {}
  );
  User.associate = function(models) {
    models.User.belongsToMany(models.Role, { through: 'User_Roles', foreignKey: 'userId', onDelete: 'CASCADE'});
    models.User.belongsToMany(models.Application, { through: 'User_Roles', foreignKey: 'userId', onDelete: 'CASCADE'});
    //models.User.belongsToMany(models.Role);
  };
  return User;
};