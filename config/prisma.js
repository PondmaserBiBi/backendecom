// config/prisma.js
const { PrismaClient } = require('@prisma/client')

// เพิ่ม error handling และ retry logic
const prisma = new PrismaClient({
    log: ['warn', 'error'],
    datasources: {
        db: {
            url: process.env.DATABASE_URL
        }
    }
})

// Function to connect with retry
async function connectWithRetry(retries = 5, delay = 3000) {
    try {
        await prisma.$connect()
        console.log('✅ Prisma connected to database successfully')
        return prisma
    } catch (error) {
        console.error(`❌ Prisma connection failed (${retries} retries left):`, error.message)

        if (retries > 0) {
            console.log(`⏳ Retrying in ${delay / 1000} seconds...`)
            await new Promise(resolve => setTimeout(resolve, delay))
            return connectWithRetry(retries - 1, delay)
        } else {
            console.error('❌ Max retries reached. Could not connect to database.')
            throw error
        }
    }
}

// Test connection immediately
connectWithRetry().catch(console.error)

// Handle graceful shutdown
process.on('beforeExit', async () => {
    await prisma.$disconnect()
    console.log('📴 Prisma disconnected')
})

module.exports = prisma