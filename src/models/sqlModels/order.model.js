import { DataTypes } from "sequelize";
import sequelize from "../../db/sqlIndex.js";

const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'pending', // pending, completed, canceled
    },
    totalAmount: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    paymentStatus: {
        type: DataTypes.STRING,
        defaultValue: 'unpaid', // unpaid, paid
    },
    address: {
        type: DataTypes.JSON, 
        allowNull: false,
        validate: {
            isAddress(value) {
                if (!value.fullName || !value.street || !value.city || !value.state || !value.zipCode || !value.country) {
                    throw new Error('Address is incomplete. Ensure all address fields are provided.');
                }
            },
        },
    },
    items:{
        type: DataTypes.JSON,
        allowNull: false
    }

},{timestamps: true})

export { Order };