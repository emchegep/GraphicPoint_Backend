const Sequelize = require('sequelize')

const sequelize = require('../util/database')

const Product = sequelize.define('product',{
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    title: {
        type: Sequelize.STRING,
        allowNull: false
    },
    price: {
        type: Sequelize.DOUBLE,
        allowNull: false
    },
    image: {
        type: Sequelize.STRING,
        allowNull: false
    },
    description: {
        type: Sequelize.STRING,
        allowNull: true
    }
})

module.exports = Product
