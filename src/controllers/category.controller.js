import asyncHandler from "../utils/AsyncHandler.utils.js"
import ApiError from "../utils/ApiError.utils.js"
import ApiResponse from "../utils/ApiResponse.utils.js"
import { Category } from "../models/sqlModels/category.model.js"

const createCategory = asyncHandler(async(req, res)=>{
    try {
        const { category } = req.body 
        if(!category || category.length == 0){
            throw new ApiError(400, "Please provide a valid name for the category !!")
        }
        const createdCategory = await Category.create({
            name: category
        })
        res.status(200).json(new ApiResponse(200, createdCategory, "successfully created new category !!"))
    } catch (error) {
        res.status(error.statusCode || 500).json(error.message || "Error creating new category !!")
    }
})

const deleteCategory = asyncHandler(async(req, res)=>{
    try {
        const { categoryId } = req.params 
        const deletedCategory = await Category.destroy({
            where: {
                id: categoryId
            }
        })
        if(!deletedCategory){
            throw new ApiError(500, "Error deleting category !!")
        }
        res.status(200).json(new ApiResponse(200, {}, "successfully deleted the category !!"))
    } catch (error) {
        res.status(error.statusCode || 500).json(error.message || "Error deleting the category !!")
    }
})

export { createCategory, deleteCategory}