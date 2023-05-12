module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn(
        "Users",
        "accountVerified",
        {
          type: Sequelize.DataTypes.BOOLEAN,
          allowNull: false,
          after: "password",
        },
        { transaction }
      );
      await queryInterface.addColumn(
        "users",
        "registrationConfirmationCode",
        {
          type: Sequelize.DataTypes.UUID,
          after: "accountVerified",
          allowNull: true,
        },
        { transaction }
      );

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeColumn("Users", "accountVerified", { transaction });
      await queryInterface.removeColumn("Users", "registrationConfirmationCode", { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
};
