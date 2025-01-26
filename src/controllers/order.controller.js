import asyncHandler from "../utils/AsyncHandler.utils.js"
import ApiError from "../utils/ApiError.utils.js"
import ApiResponse from "../utils/ApiResponse.utils.js"
import { Product } from "../models/sqlModels/product.model.js";
import { Order } from "../models/sqlModels/order.model.js";
import { User } from "../models/mongoModels/user.model.js"
import sendEmail from "../services/email.service.js";

const placeOrder = asyncHandler(async (req, res) => {
    const { totalAmount, paymentStatus = 'unpaid', address, items } = req.body;

    if (!items || items.length === 0) {
        throw new ApiError(400, "No items provided for the order.");
    }

    const userId = JSON.stringify(req.user.id);

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

const updatePaymentStatus = asyncHandler(async(req, res)=>{
    try {
        const { orderId } = req.params;
        const { paymentStatus } = req.body ;
        const updatedOrder = await Order.update({
            paymentStatus
        },
        { 
            where: {
              id: orderId
            }
        })
        if(!updatedOrder){
            throw new ApiError(500, "Error updating payment status for the given order !!")
        }
        res.status(200).json(new ApiResponse(200, {}, 'successfully updated payment status of the order given !!'))
    } catch (error) { 
        res.status(error.statusCode || 500).json(error.message || 'error updating payment status for the given order  !!')
    }
})

const getUserOrders = asyncHandler(async(req, res)=>{
    try {
            const  userId  = req.user._id;  
            const { page = 1, limit = 10 } = req.query;  
            const user = await  findById(userId);

            if (!user) {
                throw new ApiError(404, 'User not found');
            }

            const orders = await Order.findAll({
                where: {
                    userId: userId  
                },
                limit: limit,  
                offset: (Number(page) - 1) * Number(limit),  
                order: [['createdAt', 'DESC']],  
            });

            if (orders.length === 0) {
                throw new ApiError(404, 'No orders found for this user' );
            }
            const ordersWithProductImages = await Promise.all(
                orders.map(async (order) => {
                    const updatedItems = await Promise.all(
                        order.items.map(async (item) => {
                            const product = await Product.findByPk(item.productId);  
                            return {
                                ...item,
                                productImage: product ? product.images[0].url : null,
                            };
                        })
                    );
                    return {
                        ...order.dataValues, 
                        items: updatedItems,  
                    };
                })
            );
            
            const response = {
                orders: ordersWithProductImages,
                pagination: {
                    page,
                    limit,
                    totalOrders: orders.length,
                },
            };
        res.status(200).json(new ApiResponse(200, response, 'successfully fetched users orders !!'))
    } catch (error) { 
        res.status(error.statusCode || 500).json(error.message || 'error message !!')
    }
})

const getOrderById = asyncHandler(async(req, res)=>{
    try {
        const { orderId } = req.params; 
        const order = await Order.findByPk(orderId);

        if (!order) {
            throw new ApiError(404, "order not found !!")
        }
        
        const user = await User.findById(order.userId);  
        if (!user) {
            throw new ApiError(404, 'User not found' );
        }
        const updatedItems = await Promise.all(
            order.items.map(async (item) => {
                const product = await Product.findByPk(item.productId);
                return {
                    ...item,
                    productImage: product ? product.images[0].url : null, 
                };
            })
        );
        const orderDetails = {
            user: {
                id: user._id,
                name: user.name
            },
            items: updatedItems,
            ...order
        };
        res.status(200).json(new ApiResponse(200, orderDetails, 'successfully fetched order by given orderId !!'))
    } catch (error) { 
        res.status(error.statusCode || 500).json(error.message || 'error fetching order by given orderId !!')
    }
})

const updateOrderStatus = asyncHandler(async(req, res)=>{
    try {
        const { orderId } = req.params ;
        const { status } = req.body ;
        const updatedOrder = await Order.update({
            status
        }, { where: { id: orderId }});
        if(!updatedOrder){
            throw new ApiError(500, "error updating the status of given order !!")
        }
        res.status(200).json(new ApiResponse(200, {}, "successfully updated order's status !!"))
    } catch (error) { 
        res.status(error.statusCode || 500).json(error.message || 'error updating the status of given order !!')
    }
})

export { placeOrder, validateOrder, updatePaymentStatus, getUserOrders, getOrderById, updateOrderStatus};