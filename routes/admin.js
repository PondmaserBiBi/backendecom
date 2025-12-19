const express = require('express')
const router = express.Router()
const { authCheck } = require('../middleware/authCheck')



const { getOrderAdmin, changeOrderStatus, dashboardStats } = require('../controllers/admin')


router.put('/admin/order-status', authCheck, changeOrderStatus)
router.get('/admin/orders', authCheck, getOrderAdmin)

router.get('/admin', authCheck, dashboardStats)

module.exports = router