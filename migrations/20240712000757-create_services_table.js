'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('services', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            name: {
                type: Sequelize.STRING(30),
                allowNull: false,
                validate: {
                    len: [3, 30]
                }
            },
            description: {
                type: Sequelize.STRING(150),
                allowNull: false,
                validate: {
                    len: [3, 150]
                }
            }
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('services');
    }
};
