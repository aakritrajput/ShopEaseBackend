import { DataTypes } from "sequelize";
import sequelize from "../../db/sqlIndex.js";

const Category = sequelize.define('Category', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
},{timestamps: true})

export {Category};
