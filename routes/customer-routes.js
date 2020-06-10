const express = require('express')
const { body } = require('express-validator')

const customerControllers = require('../controllers/customer-controllers')

const checkAuth = require('../middleware/check-auth')

const router = express.Router()

router.post('/signup',[
    body('fname','First name is required').notEmpty().isAlpha(),
    body('lname','Last name is required').notEmpty().isAlpha(),
    body('email','Email is required').normalizeEmail().isEmail(),
    body('phone','Phone number is required').notEmpty(),
    body('password','password is required').isLength({min: 6})
],customerControllers.customerSignup)

router.post('/login',[
    body('email','Email is required').normalizeEmail().isEmail(),
    body('password','password is required').isLength({min: 6})
],customerControllers.customerLogin)

router.use(checkAuth)

router.patch('/:custId',customerControllers.updateCustomer)

//fetch customer cart
router.get('/cart',customerControllers.getCart)

//add product in the cart
router.post('/cart',customerControllers.postCart)

//delete product from cart
router.delete('/cart-delete-item',customerControllers.deleteCartProduct)

//post order
router.post('/create-order',customerControllers.createOrder)

//fetch orders by customer id
router.get('/orders',customerControllers.getOrders)

//fetch a single customer order by id
router.get('/orders/:orderId')





module.exports = router
