import { DataTypes } from "sequelize";
import sequelize from "../../db/sqlIndex.js";

const Payment = sequelize.define('Payment', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    orderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Orders', // Reference to the Order model
            key: 'id',
        },
    },
    paymentMethod: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    paymentAmount: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    paymentStatus: {
        type: DataTypes.STRING,
        defaultValue: 'pending', // pending, completed
    },
    paymentDate: {
        type: DataTypes.DATE,
        allowNull: true,
    },
});

export { Payment };