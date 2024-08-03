import { DataTypes, Model, Optional } from 'sequelize';
import sequelizeInstance from '@/lib/db/sequelize.mjs';

// Interface des attributs de l'entité "hours"
export interface HoursAttributes {
    id: number;
    days: string;
    open: string;
    close: string;
}

// Interface pour la création d'une instance "hours" (avec les attributs optionnels)
interface HoursCreationAttributes extends Optional<HoursAttributes, 'id'> {}

// Définition de la classe "Hours" qui étend Model et implémente les attributs "HoursAttributes" et "HoursCreationAttributes"
class Hours extends Model<HoursAttributes, HoursCreationAttributes> implements HoursAttributes {
    public id!: number;
    public days!: string;
    public open!: string;
    public close!: string;
}

// Initialiser le modèle
Hours.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        days: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: 'Les jours ne peuvent pas être vides.',
                },
            },
        },
        open: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: 'Le champ "ouverture" ne peut pas être vide.',
                },
            },
        },
        close: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: 'Le champ "fermeture" ne peut pas être vide.',
                },
            },
        },
    },
    {
        sequelize: sequelizeInstance,
        tableName: 'hours',
        timestamps: false,
    }
);

export default Hours;