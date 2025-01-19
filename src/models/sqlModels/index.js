import sequelize from "../../db/sqlIndex.js";
import { Category } from "./category.model.js";
import { Order } from "./order.model.js";
import { Payment } from "./payment.model.js";
import { Product } from "./product.model.js";
import { OrderProducts } from "./orderProduct.model.js";

// Define relationships
Category.hasMany(Product, { foreignKey: 'categoryId' });
Product.belongsTo(Category, { foreignKey: 'categoryId' });

Order.belongsToMany(Product, { through: OrderProducts, foreignKey: 'orderId' });
Product.belongsToMany(Order, { through: OrderProducts, foreignKey: 'productId' });

Order.hasOne(Payment, { foreignKey: 'orderId' });
Payment.belongsTo(Order, { foreignKey: 'orderId' });

export {
    sequelize,
    Product,
    Category,
    Order,
    Payment,
    OrderProducts
};
