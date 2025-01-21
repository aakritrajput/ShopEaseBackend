import asyncHandler from "../utils/AsyncHandler.utils.js"
import ApiError from "../utils/ApiError.utils.js"
import ApiResponse from "../utils/ApiResponse.utils.js"
import { Cart } from "../models/mongoModels/cart.model.js"
import { Product } from "../models/sqlModels/product.model.js"

// add item to cart 
// remove item from cart 
// get users cart -- include all its products there quantities and the total sum of the cart
// update item quantity in cart -- can be reduced or increased
// clear cart 

const addItem = asyncHandler(async(req, res)=>{
    try {
        const {productId, quantity=1 ,price} = req.body
        if(!productId || !quantity || !price){
            throw new ApiError(400, "All three details related to the product i.e, productId , quantity, price is reqquired !!")
        }
        const carts = await Cart.find({userId: req.user._id}) 
        if(carts.length > 0){
            let item = carts[0].products.find(item => item.productId == productId)
            if(item !== undefined){
                item.quantity = item.quantity + quantity ;
            }else{
                carts[0].products.push({
                    productId,
                    quantity,
                    price
                })
            }
            let totalPrice = 0;
            carts[0].products.forEach(item => {
                totalPrice += item.price * item.quantity;
            });
            carts[0].totalPrice = totalPrice;
            await carts[0].save({validateBeforeSave: false});
            res.status(200).json(new ApiResponse(200, carts[0], "Item successfully added to the cart !!"))
        }else{
            const userCart = await Cart.create({
                userId: req.user._id,
                products: [{
                    productId,
                    quantity,
                    price
                }],
                totalPrice: price*quantity 
            })

            if(!userCart){
                throw new ApiError(500, "Error creating cart for user !!")
            }

            res.status(200).json(new ApiResponse(200, userCart, "Successfully created users cart and added items to the cart !"))
        }

    } catch (error) {
        res.status(error.statusCode).json(error.message || "Error adding item to the cart !!")
    }
})

const removeItem = asyncHandler(async(req, res)=>{
    try {
        const {productId} = req.params
        const cart = await Cart.findOneAndUpdate(
            {
                userId: req.user._id
            },
            {
                $pull: {
                    products: {
                        productId
                    }
                }
            },
            {
                new: true
            }
        )
        if(!cart){
            throw new ApiError(404, "Product not found in the cart !!")
        }else{
            res.status(200).json(new ApiResponse(200,cart, "successfully removed item from the cart !!" ))
        }
    } catch (error) {
        res.status(error.statusCode || 500).json(error.message || "error removing item from the cart !! ")
    }
})

const getUserCart = asyncHandler(async(req, res)=> {
    try {
        const cart = await Cart.findOne({userId: req.user._id})
        if(!cart){
            throw new ApiError(404, "No cart found for the user !!")
        }
        const productIds = cart.products.map(product => product.productId)
        const Products = await Product.findAll({
            where: {
                id: productIds
            }
        })
        let totalPrice = 0 ;
        const productWithDetails = cart.products.map(product => {
            const productDetails = Products.find(p => p.id == product.productId)
            if (productDetails) {
                totalPrice += productDetails.price * product.quantity;
                return {
                    ...product,
                    name: productDetails.name,
                    price: productDetails.price,
                    image: productDetails.image
                };
            }
            return product;
        })

        const finalCart = {
            products: productWithDetails,
            totalPrice
        }

        res.status(200).json(new ApiResponse(200, finalCart, "Successfully fetched users cart!!"))
    } catch (error) {
        res.status(error.statusCode).json(error.message || "Error fetching users cart !!")
    }
}) 

const updateProductQuantity = asyncHandler(async(req, res)=>{
    try {
        const { updateBy } = req.params
        const cart = await Cart.findOne({userId: req.user._id})
        if(!cart){
            throw new ApiError(404, "No cart for the user !!")
        }
        let changeInPrice = 0 ;
        cart.products.forEach(product=>{
            product.quantity += Number(updateBy) ;
            changeInPrice += Number(updateBy)*product.price
        })
        cart.totalPrice = cart.totalPrice + changeInPrice ;
        await cart.save({validateBeforeSave: false});
        res.status(200).json(new ApiResponse(200, cart , "successfully changed products quantity !!"))
    } catch (error) {
        res.status(error.statusCode || 500).json(error.message || " error updating the quantity of the item in cart !! ")
    }
})

const clearCart = asyncHandler(async(req, res)=>{
    try {
        const cart = await Cart.findOne({userId: req.user._id})
        if(!cart){
            throw new ApiError(404, "No cart for the user !!")
        }
        cart.products = [];
        cart.totalPrice = 0 ;
        await cart.save({validateBeforeSave: true})
        res.status(200).json(new ApiResponse(200, cart, "successfully empty cart !!"))
    } catch (error) {
        res.status(error.statusCode || 500).json(error.message || "error clearing the cart !! ")
    }
})

export {
    addItem,
    removeItem,
    getUserCart,
    updateProductQuantity,
    clearCart
}