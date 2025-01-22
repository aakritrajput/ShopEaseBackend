import asyncHandler from "../utils/AsyncHandler.utils.js"
import ApiError from "../utils/ApiError.utils.js"
import ApiResponse from "../utils/ApiResponse.utils.js"
import { Wishlist } from "../models/mongoModels/wishlist.model.js"
import { Product } from "../models/sqlModels/product.model.js"

// add item to wishlist 
// remove from wishlist 
// get userWishlist

const addToWishlist = asyncHandler(async(req, res)=>{
    try {
        const {productId} = req.params
        const existingWishlist = await Wishlist.findOne({userId: req.user._id})
        if(!existingWishlist){
            const wishlist = await Wishlist.create({
                userId: req.user._id,
                products: [ productId ]
            })
            if(!wishlist){
                throw new ApiError(500, "Error creating wishlist for user")
            }
            res.status(200).json(new ApiResponse(200, wishlist, "Successfully created users wishlist and added item to it !!"))
        }else{
            existingWishlist.products.push(productId);
            existingWishlist.save({validateBeforeSave:false});
            res.status(200).json(new ApiResponse(200, existingWishlist, "Successfully added item to the wishlist !!"))
        }
    } catch (error) {
        res.status(error.statusCode).json(error.message || "Error adding item to wishlist !!")
    }
})

const removeFromWishlist = asyncHandler(async(req, res)=> {
    try {
        const {productId} = req.params;
        const updatedWidhlist = await Wishlist.findOneAndUpdate(
            {userId: req.user._id},
            {
                $pull: {
                    products: productId
                }
            },
            {
                new: true
            }
        )
        if(!updatedWidhlist){
            throw new ApiError(500, "Error removing item from wishlist")
        }
        res.status(200).json(new ApiResponse(200, updatedWidhlist, "Successfully removed item from wishlist !!"))
    } catch (error) {
        res.status(error.statusCode || 500).json(error.message || "Error removing item from wishlist !!")
    }
})

const getUserWishlist = asyncHandler(async(req, res)=>{
    try {
        const wishlist = await Wishlist.findOne({userId: req.user._id})
        if(!wishlist){
            throw new ApiError(404, "No wishlist found for the user !!")
        }
        const productDetails = await Product.findAll({
            where: {
                id: wishlist.products
            }
        })
        const wishlistWithProductDetails = {
            ...wishlist,
            products: productDetails
        }

        res.status(200).json(new ApiResponse(200, wishlistWithProductDetails, "Successfully fetched users wishlist !!"))
    } catch (error) {
        res.status(error.statusCode || 500).json(error.message || "Error getting users wishlist !!")
    }
})