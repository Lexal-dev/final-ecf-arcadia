import { DataTypes, Model, Optional } from 'sequelize';
import sequelizeInstance from '@/lib/db/sequelize.mjs';
import Animal from './animal'; // Importer le modèle Animal

// Définir les attributs pour VetLog
interface VetLogAttributes {
    id: number;
    animalState: string;
    foodOffered: string;
    foodWeight: number;
    createdAt: Date;
    updatedAt: Date;
    animalId: number;
}

// Définir les attributs optionnels pour la création de VetLog
interface VetLogCreationAttributes extends Optional<VetLogAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

// Définir la classe VetLog qui étend Model et implémente VetLogAttributes et VetLogCreationAttributes
class VetLog extends Model<VetLogAttributes, VetLogCreationAttributes> implements VetLogAttributes {
    public id!: number;
    public animalState!: string;
    public foodOffered!: string;
    public foodWeight!: number;
    public createdAt!: Date;
    public updatedAt!: Date;
    public animalId!: number;
}

// Initialiser le modèle VetLog
VetLog.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        animalState: {
            type: DataTypes.STRING,
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
            type: DataTypes.STRING,
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
            type: DataTypes.FLOAT,
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
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        animalId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'animals', // Nom de la table animals
                key: 'id',
            },
        },
    },
    {
        sequelize: sequelizeInstance,
        tableName: 'vetLogs',
        timestamps: true, // Activer les timestamps automatiques (createdAt et updatedAt)
        updatedAt: 'updatedAt',
    }
);

// Définir les relations
VetLog.belongsTo(Animal, { foreignKey: 'animalId' });

export default VetLog;