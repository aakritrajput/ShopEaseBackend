import asyncHandler from "../utils/AsyncHandler.utils.js"
import ApiError from "../utils/ApiError.utils.js"
import ApiResponse from "../utils/ApiResponse.utils.js"
import { Product } from "../models/sqlModels/product.model.js";
import { Order } from "../models/sqlModels/order.model.js";
import sendEmail from "../services/email.service.js";

// create order 
// cancel order 
// update payment status 
// get userOrders 
// getInventoryOrders
// getOrderById
// update order status 

const placeOrder = asyncHandler(async (req, res) => {
    const { totalAmount, paymentStatus = 'unpaid', address, items } = req.body;

    if (!items || items.length === 0) {
        throw new ApiError(400, "No items provided for the order.");
    }

    const userId = req.user.id;

    // transaction to ensure atomicity
    const transaction = await Order.sequelize.transaction();
    try {
        const order = await Order.create(
            {
                userId,
                items, 
                paymentStatus,
                address,
                totalAmount,
                status: "pending",
            },
            { transaction }
        );

        for (const item of items) {
            const product = await Product.findByPk(item.productId, { transaction });
            if (!product) {
                throw new ApiError(404, `Product with ID ${item.productId} not found.`);
            }
            if (product.stock < item.quantity) {
                throw new ApiError(400, `Insufficient stock for product: ${product.name}`);
            }
            product.stock -= item.quantity;
            await product.save({ transaction });
        }

        await transaction.commit();
        await sendEmail({
            to: req.user.email,
            subject: "Order Placed!",
            body: "Your order was successfully placed. You can track your order on the ShopEase website under 'My Orders'.",
        });
        res.status(200).json(new ApiResponse(200, order, "Order placed successfully!"));
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
});


const validateOrder = asyncHandler(async(req, res)=>{
    try {
        const { totalAmount, address, items } = req.body ; 
        if(!address || !items || !totalAmount){
            throw new ApiError(400, "please provide valid details !! ")
        }
        const productIds = items.map(obj => {
            return obj.productId ;
        });
        const products = await Product.findAll({
            where: {
                id: productIds
            },
            attributes: ['id', 'stock', 'name']
        })
        const availableProducts = products.map(product => {
            return product.id ;
        })
        //checking for stock availaibility !!
        items.map((item)=>{
            if(item.productId in availableProducts){
                products.forEach(product => {
                    if(product.stock < item.quantity){
                        throw new ApiError(404, `Not much stock for item: ${product.id} ( ${product.name} ) `)
                    }
                })
            }else {
                throw new ApiError(404, `the product with the given id ${item.productId} is no longer available in the inventory !!` )
            }
        })
        res.status(200).json(new ApiResponse(200, {}, 'order verified successfully , proceed to payment !!'))
    } catch (error) { 
        res.status(error.statusCode || 500).json(error.message || 'error verifying order !!')
    }
})