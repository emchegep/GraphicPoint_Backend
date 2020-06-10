const jwt = require('jsonwebtoken')
const HttpError = require('../models/http-error')

const checkAuth = (req,res,next)=>{
    if (req.method === 'OPTIONS'){
        next()
    }
     try {
         const token = req.headers.authorization.split(' ')[1]
        if(!token){
            return next(new HttpError('Authentication failed',403))
        }
        const decodedToken = jwt.verify(token,'Supersecret_token')
         req.customerData = {customerId: decodedToken.customerId}
        next()
     } catch (err) {
         return next(new HttpError('Authentication failed',403))
     }
}

module.exports = checkAuth
