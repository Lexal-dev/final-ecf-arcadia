'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('vetLogs', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            animalState: {
                type: Sequelize.STRING(100), // Limite de la taille du champ
                allowNull: false,
                validate: {
                    notEmpty: {
                        msg: 'Le champ état de l\'animal ne peut pas être vide.',
                    },
                    len: {
                        args: [3, 100],
                        msg: 'Le champ état de l\'animal doit avoir entre 3 et 100 caractères.',
                    },
                },
            },
            foodOffered: {
                type: Sequelize.STRING(50), // Limite de la taille du champ
                allowNull: false,
                validate: {
                    notEmpty: {
                        msg: 'Le champ nourriture proposée ne peut pas être vide.',
                    },
                    len: {
                        args: [3, 50],
                        msg: 'Le champ nourriture proposée doit avoir entre 3 et 50 caractères.',
                    },
                },
            },
            foodWeight: {
                type: Sequelize.FLOAT, // Utilisez FLOAT pour le poids de la nourriture
                allowNull: false,
                validate: {
                    isFloat: {
                        msg: 'Le champ grammage de la nourriture doit être un nombre.',
                    },
                    min: {
                        args: [0],
                        msg: 'Le champ grammage de la nourriture doit être supérieur à zéro.',
                    },
                },
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW,
            },
            updatedAt: {
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
        await queryInterface.dropTable('vetLogs');
    },
};
