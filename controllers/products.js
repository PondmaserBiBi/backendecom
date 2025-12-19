const prisma = require("../config/prisma")
const cloudinary = require('cloudinary').v2;


exports.create = async (req, res) => {
    try {

        const { title, description, price, quantity, categoryId, images } = req.body
        const product = await prisma.product.create({
            data: {
                title: title,
                description: description,
                price: parseFloat(price),
                quantity: parseInt(quantity),
                categoryId: parseInt(categoryId),
                images: {
                    create: images.map((item) => ({
                        asset_id: item.asset_id,
                        public_id: item.public_id,
                        url: item.url,
                        secure_url: item.secure_url
                    }))
                }
            }
        })

        res.send(product)

    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Server Error" })
    }
}



exports.list = async (req, res) => {

    try {

        const { count } = req.params
        const products = await prisma.product.findMany({
            take: parseInt(count),
            orderBy: { createdAt: "desc" },
            include: {
                category: true,
                images: true
            }
        })
        res.send(products)

    } catch (error) {


        console.error(error)
        res.status(500).json({ message: "Server Error" })

    }
}




exports.read = async (req, res) => {
    try {
        const { id } = req.params
        const products = await prisma.product.findFirst({
            where: {
                id: Number(id)
            },
            include: {
                category: true,
                images: true
            }
        })

        res.send(products)

    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Server Error" })
    }
}



exports.update = async (req, res) => {
    try {
        const { id } = req.params


        const { title, description, price, quantity, categoryId, images } = req.body

        await prisma.image.deleteMany({

            where: {
                productId: Number(id)
            }
        })
        const product = await prisma.product.update({
            where: {
                id: Number(id)
            },
            data: {
                title: title,
                description: description,
                price: parseFloat(price),
                quantity: parseInt(quantity),
                categoryId: parseInt(categoryId),
                images: {
                    create: images.map((item) => ({
                        asset_id: item.asset_id,
                        public_id: item.public_id,
                        url: item.url,
                        secure_url: item.secure_url
                    }))
                }
            }
        })

        res.send(product)

    } catch (error) {

        console.error(error)
        res.status(500).json({ message: "Server Error" })

    }
}

exports.remove = async (req, res) => {


    try {

        // หาสินค้า include image
        const { id } = req.params

        const product = await prisma.product.findFirst({

            where: { id: Number(id) },
            include: { images: true }
        })

        if (!product) {

            return res.status(400).json({ message: 'Product not found' })

        }


        // ลบในcloud

        const deletedImage = product.images.map((image) =>

            new Promise((resoLve, reject) => {

                cloudinary.uploader.destroy(image.public_id, (error, result) => {

                    if (error) reject(error)
                    else resoLve(result)

                })
            })
        )
        await Promise.all(deletedImage)


        // ลบสินค้า
        await prisma.product.delete({
            where: {
                id: Number(id)
            }
        })

        res.send(' Delete Success')
    } catch (error) {

        console.error(error)
        res.status(500).json({ message: "Server Error" })

    }
}

exports.listBy = async (req, res) => {


    try {

        const { sort, order, limit } = req.body

        const products = await prisma.product.findMany({
            take: limit,
            orderBy: { [sort]: order },
            include: {
                category: true,
                images: true
            }
        })

        res.send(products)
    } catch (error) {

        console.error("Prisma error:",error);

        console.error(error)
        res.status(500).json({ message: "Server Error" })

    }


}


const handleQuery = async (req, res, query) => {
    try {

        const products = await prisma.product.findMany({
            where: {
                title: {
                    contains: query,
                }
            },
            include: {

                category: true,
                images: true
            }
        })

        res.send(products)

    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Server Error" })
    }
}


const handlePrice = async (req, res, priceRange) => {
    try {

        const products = await prisma.product.findMany({
            where: {
                price: {
                    gte: priceRange[0],
                    lte: priceRange[1]
                }
            },
            include: {
                category: true,
                images: true
            }
        })
        res.send(products)

    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Server Error" })
    }
}


const handlecategory = async (req, res, categoryId) => {
    try {

        const products = await prisma.product.findMany({

            where: {
                categoryId: {
                    in: categoryId.map((id) => Number(id))
                }
            },
            include: {
                category: true,
                images: true
            }
        })
        res.send(products)

    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Server Error" })
    }
}

exports.searchFilters = async (req, res) => {

    try {
        const { query, category, price } = req.body;


        if (query) {

            await handleQuery(req, res, query);

        }

        if (category) {

            await handlecategory(req, res, category);

        }

        if (price) {

            await handlePrice(req, res, price);

        }




    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
}






cloudinary.config({

    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET

});

exports.createimages = async (req, res) => {

    try {

        const result = await cloudinary.uploader.upload(req.body.image, {

            public_id: `Pond ${Date.now()}`,
            resource_type: `auto`,
            folder: 'Ecom2025'

        })

        res.send(result)

    } catch (error) {

        console.log(error)
        res.status(500).json({ message: 'Server Error' })
    }
}

exports.removeImage = async (req, res) => {

    try {

        const { public_id } = req.body

        cloudinary.uploader.destroy(public_id, (result) => {

            res.send('Remove Image Success')

        })



    } catch (error) {

        console.log(error)
        res.status(500).json({ message: 'Server Error' })
    }
}