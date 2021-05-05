'use strict';
module.exports = (sequelize, DataTypes) => {
  const PasswordReset = sequelize.define('PasswordReset', {
    id: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      autoIncrement: false
    },
    userid: DataTypes.INTEGER  }, 
  {paranoid: true, freezeTableName: true});
  PasswordReset.associate = function(models) {
    // associations can be defined here
    PasswordReset.belongsTo(models.User);
  };
  return PasswordReset;
};