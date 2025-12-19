const prisma = require("../config/prisma")
const stripe = require('stripe')('sk_test_51SbHXGGfmYSUd3hAPc1APxxMpNqe2ezLaKZP3HjQrL2kbtsfZ6DP21iNlzUoLr3F01WRapmdrNswWbNyGSCaqqqB00iUGn2D3j');


exports.payment = async (req, res) => {

    try {

        const cart = await prisma.cart.findFirst({

            where: {

                orderedById: req.user.id
            }

        })

        const amountTHB = cart.cartTotal * 100



        const paymentIntent = await stripe.paymentIntents.create({

            amount: amountTHB,
            currency: 'thb',

            automatic_payment_methods: {
                enabled: true,
            },
        })

        res.send({
            clientSecret: paymentIntent.client_secret,
        })

    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Server Error' })

    }
}
