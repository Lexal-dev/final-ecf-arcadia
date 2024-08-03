import { DataTypes, Model, Optional } from 'sequelize';
import sequelizeInstance from '@/lib/db/sequelize.mjs';

interface SpecieAttributes {
    id: number;
    name: string;
}

interface SpecieCreationAttributes extends Optional<SpecieAttributes, 'id'> {}

class Specie extends Model<SpecieAttributes, SpecieCreationAttributes> implements SpecieAttributes {
    public id!: number;
    public name!: string;
}

Specie.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(50), // Limite de la longueur du nom à 50 caractères
            allowNull: false,
            unique: true,
            validate: {
                len: {
                    args: [3, 50],
                    msg: "Le nom doit être compris entre 3 et 50 caractères",
                },
            },
        },
    },
    {
        sequelize: sequelizeInstance,
        tableName: 'species',
        timestamps: false,
    }
);

export function associateModels() {
    const Animal = require('./animal').default;
    Specie.hasMany(Animal, { foreignKey: 'specieId' });
}

export default Specie;