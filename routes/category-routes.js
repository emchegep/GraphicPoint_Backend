const express = require('express')

const categoryControllers = require('../controllers/category-controllers')

const router = express.Router()


router.get('/',categoryControllers.getCategories)

router.post('/new',categoryControllers.addCategory)

module.exports = router
