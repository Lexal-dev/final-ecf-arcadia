import { DataTypes, Model, Optional } from 'sequelize';
import sequelizeInstance from '@/lib/db/sequelize.mjs';
import Specie from './specie';
import Habitat from './habitat';

interface AnimalAttributes {
    id: number;
    name: string;
    etat: string;
    specieId?: number | null; 
    habitatId?: number | null;
    imageUrl?: string[] | null;
}

interface AnimalCreationAttributes extends Optional<AnimalAttributes, 'id'> {
    imageUrl?: string[] | null;
    specieId?: number | null; 
    habitatId?: number | null;
}

class Animal extends Model<AnimalAttributes, AnimalCreationAttributes> implements AnimalAttributes {
    public id!: number;
    public name!: string;
    public etat!: string;
    public specieId!: number; 
    public habitatId!: number;
    public imageUrl!: string[] | null;
}

Animal.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                len: {
                    args: [3, 30],
                    msg: "Le nom doit être compris entre 3 et 30 caractères",
                },
            },
        },
        etat: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: {
                    args: [3, 100],
                    msg: "Le message d'état doit être compris entre 3 et 100 caractères",
                },
            },
        },
        specieId: { 
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'species', 
                key: 'id',
            },
        },
        habitatId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'habitats',
                key: 'id',
            },
        },
        imageUrl: {
            type: DataTypes.JSON,
            allowNull: true,
        },
    },
    {
        sequelize: sequelizeInstance,
        tableName: 'animals',
        timestamps: false,
    }
);


export function associateModels() {
    // Association
    Animal.belongsTo(Specie, { foreignKey: 'specieId' }); 
    Animal.belongsTo(Habitat, { foreignKey: 'habitatId' });
}

export default Animal;