const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { validationResult } = require('express-validator')

const HttpError = require('../models/http-error')

const Customer = require('../models/customer')
const Product = require('../models/product')


//customer login
exports.customerLogin = async (req,res,next)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return next(new HttpError('Invalid inputs.Please confirm your details and try again',422))
    }

    const {email, password } = req.body

    let existingCustomer;
    try{
        existingCustomer = await Customer.findAll({where:{email: email}})
        console.log(existingCustomer[0].dataValues.email)
    } catch (err) {
        return next(new HttpError('Login failed. Please try again',500))
    }
    if (!existingCustomer[0].dataValues){
        return next(new HttpError('Invalid credentials.Try again',401))
    }

    let isPasswordValid;
    try{
        isPasswordValid = await bcrypt.compare(password,existingCustomer[0].dataValues.password)
    }catch (err) {
        return next(new HttpError('Login failed password failure. Please try again',500))
    }

    if (!isPasswordValid){
        return next(new HttpError('Invalid credentials.Try again',401))
    }

    let token;
    try {
        let payload = {customerId: existingCustomer[0].dataValues.id, email: existingCustomer[0].dataValues.email}
        token = jwt.sign(payload,'Supersecret_token', {expiresIn: '2hr'})
    } catch (err) {
        return next(new HttpError('Login failed. Please try again',500))
    }
    res.status(200).json({fname: existingCustomer[0].dataValues.fname,lname: existingCustomer[0].dataValues.lname, email:existingCustomer[0].dataValues.email, token: token})
}

//customer signup
exports.customerSignup = async (req,res,next)=>{
const errors = validationResult(req)
    if(!errors.isEmpty()){
        return next(new HttpError('Invalid inputs.Please cconfirm your details and try again',422))
    }
    const {fname,lname, email,phone, password, } = req.body

    let hashedPassword;
    try {
        hashedPassword = await bcrypt.hash(password,12)
    }catch (err) {
        return next(new HttpError('Failed to create an account.Try again later',500))
    }

    let responseData;
    try {
        responseData = await Customer.create({
            fname,
            lname,
            email,
            phone,
            password: hashedPassword
        })
        console.log(responseData.dataValues)
    } catch (err) {
        return next(new HttpError('Failed to create an account.Try again later',500))
    }

    let token;
    try {
        let payload = {customerId: responseData.dataValues.id, email: responseData.dataValues.email}
        token = jwt.sign(payload,'Supersecret_token',{expiresIn: '2hr'})
    } catch (err) {
        return next(new HttpError('Failed to create an account.Try again later',500))
    }
    res.status(201).json({fname: responseData.dataValues.fname,lname: responseData.dataValues.lname, email: responseData.dataValues.email, token : token})
}

//update customer details
exports.updateCustomer = async (req,res,next)=>{

}

//creating a new cart
exports.postCart = async (req,res,next)=>{
    const prodId = req.body.prodId
    let customer;
    try {
       customer = await Customer.findByPk(req.customerData.customerId)
    } catch (err) {
        return next(new HttpError('Failed to create cart serching user.Try again later',500))
    }

    if (!customer){
        return next(new HttpError('Failed to create the cart not customer.Try again later',401))
    }

    let cart;
    let products;
    try{
        cart = await customer.getCart()
        if (!cart){
            cart = await  customer.createCart()
        }
        products = await cart.getProducts({where:{id: prodId}})

        let product;
        if (products.length > 0){
            product = products[0]
        }
        let newQuantity = 1
        if(product){
           let oldQuantity = await product.cartItem.quantity
            newQuantity = oldQuantity + 1
        } else {
            product = await Product.findByPk(prodId)
        }
        let result = await cart.addProduct(product,{through: {quantity: newQuantity}})
    } catch (err) {
        return next(new HttpError('Failed to create cart.Try again later',500))
    }

    res.status(200).json({message: 'Cart created successfully'})
}

//get customer cart
exports.getCart = async (req,res,next)=>{
    const customerId = req.customerData.customerId

    let customer
    try
    {
      customer = await Customer.findByPk(customerId)
    }catch (err) {
        return next(new HttpError('Failed to fetch the cart.Try again later',500))
    }

    if (!customer){
        return next(new HttpError('No cart available for you.',401))
    }

    let cart
    let products
    try{
        cart = await customer.getCart()
        products = await cart.getProducts()
    }catch (err) {
        return next(new HttpError('Failed to fetch the cart.Try again later',500))
    }
    if (!products){
        return next(new HttpError('No products available for you.',401))
    }
    res.status(200).json({products: products})
}

//delete a product from cart
exports.deleteCartProduct = async (req,res,next)=>{
    const prodId = req.body.prodId
    let customer;
    try {
        customer = await Customer.findByPk(req.customerData.customerId)
    }catch (err) {
        return  next(new HttpError('Error deleting the product.Please try again later',500))
    }

    let cart;
    let products;
    try {
        cart =await customer.getCart()
        products = await cart.getProducts({where:{id: prodId}})
        let product = products[0]
       let result =  await product.cartItem.destroy()
    }catch (err) {
        return  next(new HttpError('Error deleting the product.Please try again later',500))
    }
    res.status(200).json({message: "product removed from the cart"})
}

//create order
exports.createOrder = async (req,res,next)=> {
    let customer;
    try {
        customer = await Customer.findByPk(req.customerData.customerId)
    } catch (err) {
        return next(new HttpError('Failed to post order .please try again later', 500))
    }

    let cart;
    let products;
    try {
        cart = await customer.getCart()
        products = await cart.getProducts()
        let order = await customer.createOrder()
        let responseData = await order.addProducts(products.map(product => {
            product.orderItem = {quantity: product.cartItem.quantity}
            return product
        }))
        await cart.setProducts(null)
    } catch (err) {
        return next(new HttpError('Failed to post order.please try again later', 500))
    }

    res.status(201).json({message: "order created!"})
}

exports.getOrders = async (req,res,next) =>{
    let customer;
    let orders;
    try{
        customer = await Customer.findByPk(req.customerData.customerId)
        orders = await customer.getOrders({include:['products']})
    }catch (err) {
        return next(new HttpError('Fetching orders failed. try again later',500))
    }

    res.status(200).json({orders: orders})
}


