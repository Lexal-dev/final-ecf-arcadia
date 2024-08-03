import { DataTypes, Model, Optional } from 'sequelize';
import sequelizeInstance from '@/lib/db/sequelize.mjs';


export interface HoursAttributes {
    id: number;
    days: string;
    open: string;
    close: string;
}

interface HoursCreationAttributes extends Optional<HoursAttributes, 'id'> {}


class Hours extends Model<HoursAttributes, HoursCreationAttributes> implements HoursAttributes {
    public id!: number;
    public days!: string;
    public open!: string;
    public close!: string;
}


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