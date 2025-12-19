const express = require('express')
const router = express.Router()

// import controller
const { register, login, currentuser } = require('../controllers/authcontroller')

const { authCheck, adminCheck } = require('../middleware/authCheck')



router.post('/register', register)
router.post('/login', login)
router.post('/currentuser', authCheck, currentuser)
router.post('/currentadmin', authCheck, adminCheck, currentuser)

module.exports = router