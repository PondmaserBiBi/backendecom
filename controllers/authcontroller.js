const prisma = require('../config/prisma')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

exports.register = async (req, res) => {

    try {
        const { email, password } = req.body
        if (!email) {
            return res.status(400).json({ massage: 'Email is required' })
        }
        if (!password) {
            return res.status(400).json({ message: ' password is require' })
        }

        // เช็คเมลในDB
        const user = await prisma.user.findFirst({
            where: {
                email: email
            }
        })
        // เช็คว่าลงทะเบียนยัง
        if (user) {
            return res.status(400).json({ message: "Email already exits" })
        }

        // genรหัสผ่าน
        const salt = bcrypt.genSaltSync(10);
        const hasedPassword = bcrypt.hashSync(password, salt);

        // เพิ่มข้อมูลลง db
        await prisma.user.create({
            data: {
                email: email,
                password: hasedPassword
            }
        })

        res.send('Register Succesfully')

    } catch (error) {

        console.error("Server Error:", error)
        res.status(500).json({ massage: "Not Found" })
    }

}

exports.login = async (req, res) => {

    try {
        // check email
        const { email, password } = req.body

        const user = await prisma.user.findFirst({
            where: {
                email: email

            }
        })

        if (!user || !user.enabled) {
            return res.status(400).json({ message: 'User Not found' })

        }

        // check password
        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            return res.status(400).json({ message: "Password Invalid" })

        }


        const payload = {
            id: user.id,
            email: user.email,
            role: user.role
        }

        // gen token
        jwt.sign(payload, process.env.SECRET, {

            expiresIn: '1d'
        }, (err, token) => {

            if (err) {
                return res.status(500).json({ message: "Sever Error" })

            }
            res.json({ payload, token })

        })
    } catch (error) {
        console.error("Server Error:", error)
        res.status(500).json({ massage: "Server Error" })
    }
}


exports.currentuser = async (req, res) => {
    try {

        const user = await prisma.user.findFirst({

            where: { email: req.user.email },

            select: {
                
                id: true,
                email: true,
                name: true,
                role: true
            }

        })
        res.json({ user })

    } catch (error) {

        console.error("Server Error", error)
        res.status(500).json({ massage: "Server Error" })
    }
}