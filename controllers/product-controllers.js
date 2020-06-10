const { validationResult } = require('express-validator')

const Product = require('../models/product')
const Category = require('../models/category')
const HttpError = require('../models/http-error')

//fetching all products
exports.getProducts = async (req,res,next)=>{
let products
    try{
        products = await Category.findAll({include:['products']})
        if(products.length === 0){
            return next(new HttpError('No products available',404))
        }
    } catch (err) {
        return next(new HttpError('Error fetching products.Try again later',500))
    }
    res.status(200).json({products: products})
}


//fetch a single product by id
exports.getProduct = async (req,res,next)=>{
    const prodId = req.params.prodId
    try{
        const product = await Product.findAll({where:{id:prodId}})
        if(!product){
            return  next(new HttpError('No product with this id.',404))
        }
        res.status(200).json({product:product})
    }catch (err) {
      return next(new HttpError('Fetching Product Failed Try again later',500))
    }
}

//fetch all category products/templates
exports.getProductsByCategoryId = async (req,res,next)=>{
    const categoryId = req.params.categoryId

    let products
    try{
        products = await Product.findAll({where:{categoryId: categoryId}})
    }catch (err) {
        return next(new HttpError('Fetching category products/templates failed',500))
    }

    if (products.length === 0){
        return next(new HttpError('No products for this categories',401))
    }

    res.status(200).json({products: products})
}

//adding a new product
exports.addProduct = async (req,res,next)=>{
    const errors = validationResult(req)

    if(!errors.isEmpty()){
        return next(new HttpError('Invalid inputs. Please check and try again',401))
    }

    const title = req.body.title
    const price = req.body.price
    const image = req.body.image
    const description = req.body.description
    const categoryId = req.body.categoryId

    try{
        const responseData = await Product.create({
            title,
            price,
            image,
            description,
            categoryId
        })
        console.log(responseData)
        res.status(201).json({message: "Product added successfully"})
    } catch (err) {
        return next(new HttpError('Could not add the product.Please try again later',500))
    }
}

//updating a product
exports.updateProduct = async (req,res,next)=>{
    const prodId = req.params.prodId
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return next(new HttpError('Invalid data. Please check and try again',422))
    }
    const { title, price, image, description } = req.body
    let product;
    try {
        product = await Product.findByPk(prodId)
        if (!product){
            return next(new HttpError('Product not found.',404))
        }
        product.title = title
        product.price = price
        product.image = image
        product.decscription = description

        const result = await product.save()

        res.status(200).json({message:"Product updated successfully"})
    } catch(err){
        return next(new HttpError('Failed to update the product.Try again later',500))
    }
}

//delete a product
exports.deleteProduct = async (req,res,next)=>{
    const prodId = req.params.prodId
    try{
        const product = await Product.findByPk(prodId)
        if(!product){
            return next(new HttpError('No product with that id',404))
        }
        await product.destroy()
        res.status(200).json({message: "Product deleted successfully"})
    } catch (err) {
        return next(new HttpError('Failed to delete product.Try again later',500))
    }
}


