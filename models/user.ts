import { DataTypes, Model } from "sequelize";
import bcrypt from "bcryptjs";
import sequelize from "@/lib/db/sequelize.mjs";

const SALT_ROUNDS = 10;

interface UserAttributes {
  id?: number;
  email: string;
  password: string;
  role: string;
}

class User extends Model<UserAttributes> implements UserAttributes {
  public id!: number;
  public email!: string;
  public password!: string;
  public role!: string;

  // Hash password out to save
  public async setPassword(password: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    this.password = hashedPassword;
  }

  // Compare password with hash password
  public async comparePassword(password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: {
          msg: "Email must be valid.",
        },
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [12, 100],
          msg: "Le mot de passe doit contenir au moins 12 caractères.",
        },
        isStrongPassword(value: string) {
          const regex = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-zA-Z]).{12,}$/;
          if (!regex.test(value)) {
            throw new Error(
              "Le mot de passe doit contenir au moins 12 caractères, dont un chiffre, un caractère spécial, et une lettre."
            );
          }
        },
      },
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "EMPLOYEE",
    },
  },
  {
    sequelize,
    tableName: "users",
    timestamps: false,
  }
);

export default User;
