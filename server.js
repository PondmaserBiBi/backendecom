// Step 1 import ....
const express = require('express')
const app = express()
const morgan = require('morgan')
const { readdirSync } = require('fs')
const cors = require('cors')



// middleware
app.use(morgan('dev'))
app.use(express.json({ limit: '20mb' }))
app.use(cors())



readdirSync('./routes')
    .map((c) => app.use('/', require('./routes/' + c)))








//  Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

