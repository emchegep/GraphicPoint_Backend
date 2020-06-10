const HttpError = require('../models/http-error')

const Category = require('../models/category')


//fetch all categories
exports.getCategories = async (req,res,next)=>{
    let categories
    try{
        categories = await Category.findAll()
    } catch (err) {
        return next(new HttpError('Failed to fetch categories',500))
    }

    if (categories.length === 0){
        return next(new HttpError('No category found',401))
    }

    res.status(200).json({categories: categories})
}

//create a new category
exports.addCategory = async (req,res,next)=>{
    const { title } = req.body
    try{
        const result = await Category.create({title})
    }catch (err) {
        return next(new HttpError('Failed to add new category',500))
    }
    res.status(201).json({message: "Category added successfully"})
}
