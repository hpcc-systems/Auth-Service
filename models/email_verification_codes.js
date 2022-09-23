"use strict";
module.exports = (sequelize, DataTypes) => {
  const Email_verification_code = sequelize.define(
    "Email_verification_code",
    {
      verificationCode: {
        primaryKey: true,
        type: DataTypes.UUIDV4,
      },
    },
    {}
  );
  Email_verification_code.associate = function (models) {
    // associations can be defined here
  };
  return Email_verification_code;
};
