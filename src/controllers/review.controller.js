import asyncHandler from "../utils/AsyncHandler.utils.js"
import ApiError from "../utils/ApiError.utils.js"
import ApiResponse from "../utils/ApiResponse.utils.js"
import { Review } from "../models/mongoModels/review.model.js"

// add review
// edit review
// delete review
// get users review 

const addReview = asyncHandler(async(req, res)=>{
    try {
        const {rating , comment} = req.body
        const {productId} = req.params

        if(!rating || comment.trim().length === 0){
            throw new ApiError(400, "Rating or comment cannot be empty !!")
        }

        const review = await Review.create({
            userId: req.user._id,
            productId,
            rating: Number(rating),
            comment
        })

        if(!review){
            throw new ApiError(500, "Error adding review for the product")
        }

        res.status(200).json(new ApiResponse(200, review, "successfully added review for the product !!"))
    } catch (error) {
        res.status(error.statusCode || 500).json(error.message || "Error adding review !!")
    }
})

const editReview = asyncHandler(async(req, res)=>{
    try {
        const {rating , comment} = req.body
        const {productId} = req.params

        if(!rating || comment.trim().length === 0){
            throw new ApiError(400, "Rating or comment cannot be empty !!")
        }

        const updateReview = await Review.findOneAndUpdate({
            userId: req.user._id,
            productId
            },
            {
                rating: Number(rating),
                comment
            },{
                new: true
            }
        )

        if(!updateReview){
            throw new ApiError(500, "Error updating your review for the product")
        }

        res.status(200).json(new ApiResponse(200, updateReview, "successfully updated your review for the product !!"))
    } catch (error) {
        res.status(error.statusCode || 500).json(error.message || "Error updating your review !!")
    }
})

const deleteReview = asyncHandler(async(req, res)=>{
    try {
        const {productId} = req.params
        const deletedReview = await Review.findOneAndDelete({
            userId: req.user._id,
            productId
        })
        if(!deletedReview){
            throw new ApiError(500, "error deleting your review !!")
        }
        res.status(200).json(new ApiResponse(200, {}, "successfully deleted your review for the product !!"))
    } catch (error) {
        res.status(error.statusCode || 500).json(error.message || "Error deleting your review !!")
    }
})

const getProductReviews = asyncHandler(async(req, res)=>{
    try {
        const {productId} = req.params
        const productReviews = await Review.aggregate([
            {
                $match: {
                    productId
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user',
                    pipeline: [
                        {
                            $project: {
                                name: 1
                            }
                        }
                    ]
                }
            },
            {
                $unwind: '$user'
            }
        ])
        if(productReviews.length === 0){
            throw new ApiError(404, "No reviews for the product !!")
        }
        res.status(200).json(new ApiResponse(200, productReviews, "successfully fetched product reviews !!" ))
    } catch (error) {
        res.status(error.statusCode).json(error.message || "Error getting product reviews !!")
    }
})

export {
    addReview,
    editReview,
    deleteReview,
    getProductReviews
}