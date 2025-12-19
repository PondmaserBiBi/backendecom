const express = require('express')
const router = express.Router()

const { payment } = require('../controllers/stripe')
const { authCheck } = require('../middleware/authCheck')


router.post('/user/create-payment-intent', authCheck, payment)

module.exports = router