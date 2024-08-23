'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('species', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            name: {
                type: Sequelize.STRING(50), // Limiter la longueur du nom à 50 caractères
                allowNull: false,
                unique: true,
                validate: {
                    len: [3, 50], // Validation de longueur pour Sequelize
                },
            },
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('species');
    },
};