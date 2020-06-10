const express = require('express')
const { body } = require('express-validator')

const router = express.Router()

const productControllers = require('../controllers/product-controllers')

router.get('/',productControllers.getProducts)

router.get('/:prodId',productControllers.getProduct)

router.get('/category/:categoryId',productControllers.getProductsByCategoryId)

router.post('/new',[
    body('title','Title is required').notEmpty(),
    body('price','Price should be a number').isFloat(),
    body('image','Image is required').notEmpty(),
    body('description','Description should be atleast 5 characters').isLength({min:5})
],productControllers.addProduct)

router.patch('/:prodId',productControllers.updateProduct)


router.delete('/:prodId',productControllers.deleteProduct)

module.exports = router
