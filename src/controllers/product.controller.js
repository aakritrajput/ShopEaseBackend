import asyncHandler from "../utils/AsyncHandler.utils.js"
import ApiError from "../utils/ApiError.utils.js"
import ApiResponse from "../utils/ApiResponse.utils.js"
import { Product } from "../models/sqlModels/product.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.utils.js"
import { Category } from "../models/sqlModels/category.model.js"

// add a product  --> title , images , description , price , categories , stock , seller 
// change product stock 
// delete product from site !! 
// get / search all products based on query || based on category --> search && also implement filter by price || rating || stock
// get all products --> pagination 
// get sellers all product 
// get a product 
// update product details !!

const addProduct = asyncHandler(async(req, res)=>{
    try {
        const {name, price, description, stock=1, category} = req.body ;
        const reqDetails = [name, price ,description, stock ];
        const ifAnyDetailInvalid = reqDetails.some(val => !val || val.trim().length === 0 );
        if(ifAnyDetailInvalid){
            throw new ApiError(400, "Please provide all required details")
        }
        const user = req.user ;
        if(user.role !== "seller"){
            throw new ApiError(400, "You are not authorized as a seller to perform this action !!")
        }
        const photos = req.files ;
        const uploadedPhotos = await Promise.all(
            photos.map(async (photo) => {
              const file = await uploadOnCloudinary(photo.path);
              return {
                url: file.secure_url,
                publicId: file.public_id,
              };
            })
          );
      
        const product = await Product.create({
            name,
            price,
            description,
            stock,
            category : category ? category : "",
            images: uploadedPhotos,
            seller: JSON.stringify(user._id)
        })
        if(!product){
            throw new ApiError(500, "error adding product to the database!!")
        }
        res.status(200).json(new ApiResponse(200, product, "successfully added prduct to the inventory !!"))
    } catch (error) {
       res.status(error.statusCode || 500).json(error.message || "error adding product to your inventory !!")
    }
})

const updateStock = asyncHandler(async(req, res)=>{
    try {
        const { productId } = req.params 
        const { updateBy } = req.body 
        const product = await Product.findByPk( productId, {
            attributes: ['stock']
        })
        let newStock = product.stock + Number(updateBy) ;
        if(newStock < 0){
            throw new ApiError(400, "Stock cannot be less than zero !!")
        }
        product.stock = newStock ;
        await product.save({validate:false})
        res.status(200).json(new ApiResponse(200, product, "successfully updated stock !!"))
    } catch (error) {
        res.status(error.statusCode || 500).json(error.message || "error updating product stock !!")
    }
})

const deleteProduct = asyncHandler(async(req, res)=>{
    try {
        const { productId } = req.params ;
        const deletedProduct = await Product.destroy({
            where: {
                id: productId
            }
        })
        if(!deletedProduct){
            throw new ApiError(404, "Error deleting product , as no product found with the given productId")
        }
        res.status(200).json(new ApiResponse(200, {}, "successfully deleted the product !!"))
    } catch (error) {
        res.status(200).json(error.message || "Error deleting product from the website !!")
    }
})

const searchProduct = asyncHandler(async(req, res)=> {
    try {
        const { query , page=1 , limit=10 , category} = req.query ;
        const offset = ( Number(page) - 1 ) * Number(limit) ;
        if(category){
            const categoryId  = await Category.findOne({
                where: {
                    name: category
                }
            })
            const {count: productCount, rows: products} = await Product.findAndCountAll({
                where: {
                    categoryId
                },
                limit: Number(limit),
                offset,
                order: [
                    ['createdAt','DESC']
                ]
            })

            const resData = {
                products,
                productCount,
                hasMore: ( productCount / Number(limit) ) - Number(page)  === 0 ? false : true ,
                totalPages: productCount / Number(limit) ,
                currentPage: Number(page)
            }

            res.status(200).json(new ApiResponse(200, resData, "successfully fetched products for the given category !!"))
        }else{
            if(!query){
                throw new ApiError(400, "Query is required , please pass some query to search for products !!")
            }
            const {count: productCount, rows: products} = await Product.findAndCountAll({
                where: {
                    [Op.or]: [
                        sequelize.where(sequelize.fn('LOWER', sequelize.col('name')), 'LIKE', `%${query.toLowerCase()}%`),
                        sequelize.where(sequelize.fn('LOWER', sequelize.col('description')), 'LIKE', `%${query.toLowerCase()}%`)
                      ]
                },
                limit: Number(limit),
                offset,
                order: [
                    ['createdAt','DESC']
                ]
            }) 
            const resData = {
                products,
                productCount,
                hasMore: ( productCount / Number(limit) ) - Number(page)  === 0 ? false : true ,
                totalPages: productCount / Number(limit) ,
                currentPage: Number(page)
            }

            res.status(200).json(new ApiResponse(200, resData, "successfully fetched products for the given query !!"))
        }
    } catch (error) {
        res.status(error.statusCode || 500).json(error.message || "Error searching products for the given query !!")
    }
})

const getAllProducts = asyncHandler(async(req, res)=>{
    try {
        const { page=1 , limit=10 } = req.query ;
        const offset = ( Number(page) - 1 ) * Number(limit) ;
        const {count: productCount, rows: products} = await Product.findAndCountAll({
            limit: Number(limit),
            offset,
            order:[
                ['createdAt', 'DESC']
            ]
        })
        const resData = {
            products,
            productCount,
            hasMore: ( productCount / Number(limit) ) - Number(page)  === 0 ? false : true ,
            totalPages: productCount / Number(limit) ,
            currentPage: Number(page)
        }

        res.status(200).json(new ApiResponse(200, resData, "successfully fetched products for the given query !!"))

    } catch (error) {
        res.status(error.statusCode || 500).json(error.message || "Error getting all products for the given query !!")
    }
})

const getSellersAllProducts = asyncHandler(async(req, res)=>{
    try {
        const { page=1 , limit=10 } = req.query ;
        const {sellerId} = req.params ;
        const offset = ( Number(page) - 1 ) * Number(limit) ;
        const {count: productCount, rows: products} = await Product.findAndCountAll({
            where: {
                seller: JSON.stringify(sellerId)
            },
            limit: Number(limit),
            offset,
            order:[
                ['createdAt', 'DESC']
            ]
        })
        const resData = {
            products,
            productCount,
            hasMore: ( productCount / Number(limit) ) - Number(page)  === 0 ? false : true ,
            totalPages: productCount / Number(limit) ,
            currentPage: Number(page)
        }

        res.status(200).json(new ApiResponse(200, resData, "successfully fetched sellers all products !!"))

    } catch (error) {
        res.status(error.statusCode || 500).json(error.message || "Error getting sellers all products  !!")
    }
})

const getProduct = asyncHandler(async(req, res)=>{
    try {
        const { productId } = req.params ;
        
        res.status(200).json(new ApiResponse(200, resData, "successfully fetched the given product!!"))

    } catch (error) {
        res.status(error.statusCode || 500).json(error.message || "Error getting the given product  !!")
    }
})

export { addProduct }