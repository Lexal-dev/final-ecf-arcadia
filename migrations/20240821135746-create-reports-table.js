'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('reports', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            food: {
                type: Sequelize.STRING, // PostgreSQL VARCHAR
                allowNull: false,
                validate: {
                    notEmpty: {
                        msg: 'Le champ food ne peut pas être vide.',
                    },
                },
            },
            quantity: {
                type: Sequelize.INTEGER,
                allowNull: false,
                validate: {
                    isInt: {
                        msg: 'Le champ quantity doit être un entier.',
                    },
                    min: {
                        args: [1],
                        msg: 'Le champ quantity doit être supérieur à zéro.',
                    },
                },
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW,
            },
            animalId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'animals', 
                    key: 'id',
                },
            },
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('reports');
    },
};