module.exports = {
    up: (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface.changeColumn('Application', 'id', {
                type: Sequelize.UUID,
                allowNull: true,
            })
        ])
    },

    down: (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface.changeColumn('Application', 'id', {
                type: Sequelize.STRING,INTEGER,
                allowNull: true,
            })
        ])
    }
};