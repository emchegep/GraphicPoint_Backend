const express = require('express')
const bodyParser = require('body-parser')

const sequelize = require('./util/database')

//importing routes
const productRoutes = require('./routes/product-routes')
const customerRoutes = require('./routes/customer-routes')
const categoryRoutes = require('./routes/category-routes')

//importing models
const Customer = require('./models/customer')
const Product = require('./models/product')
const Cart = require('./models/cart')
const CartItem = require('./models/cart-item')
const Category = require('./models/category')
const Order = require('./models/order')
const OrderItem = require('./models/order-item')

const app = express()

app.use(bodyParser.json())

app.use((req,res,next)=>{
    res.setHeader('Access-Control-Allow-Origin','*')
    res.setHeader('Access-Control-Allow-Headers','Origin,X-Requested-With,Content-Type,Accept,Authorization')
    res.setHeader('Access-Control-Allow-Methods','GET,POST,PATCH,PUT,DELETE,OPTIONS')
    next()
})

//routes middlewares
app.use('/api/products',productRoutes)
app.use('/api/customers',customerRoutes)
app.use('/api/categories',categoryRoutes)

app.use((error,req,res,next)=>{
    if (res.headerSent){
        return next(error)
    }
    res.status(error.statusCode || 500)
    res.json({message: error.message || "Unknown error"})
})

//implementing associations
Product.belongsTo(Category,{constraints: true, onDelete:'CASCADE'})
Category.hasMany(Product)
Customer.hasOne(Cart)
Cart.belongsTo(Customer)
Cart.belongsToMany(Product,{through: CartItem})
Product.belongsToMany(Cart, {through: CartItem})
Order.belongsTo(Customer)
Customer.hasMany(Order)
Order.belongsToMany(Product, {through: OrderItem})
Product.belongsToMany(Order,{through: OrderItem})

//connecting to the database and starting the server
sequelize
    .sync()
    .then(result => {
        app.listen(5000)
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

