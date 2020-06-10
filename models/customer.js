const Sequelize = require('sequelize')

const sequelize = require('../util/database')

const Customer = sequelize.define('customer',{
    id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    },
    fname: Sequelize.STRING,
    lname: Sequelize.STRING,
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    phone: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    password:{
        type: Sequelize.STRING,
        allowNull: false
    }
})

module.exports = Customer
