import { DataTypes } from "sequelize";
import sequelize from "../../db/sqlIndex.js";

const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.INTEGER, 
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT
    },
    stock: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    images: {
        type: DataTypes.JSON    //{url: "", publickey: ""}
    },
    category: {
        type: DataTypes.STRING
    },
    seller : {
        type: DataTypes.STRING,
        allowNull: false
    }
},{timestamps: true})

export { Product };