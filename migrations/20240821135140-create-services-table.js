'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('services', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            name: {
                type: Sequelize.STRING, // Définir une longueur maximale si nécessaire
                allowNull: false,
                validate: {
                    len: [3, 30],
                },
            },
            description: {
                type: Sequelize.STRING, // Définir une longueur maximale si nécessaire
                allowNull: false,
                validate: {
                    len: [3, 150],
                },
            },
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('services');
    },
};