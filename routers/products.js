const {Product} = require('../models/Product');
const {Category} = require('../models/Category');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
}

const storage = multer.diskStorage({
    destination: function(req,file,cb){
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('Invalid image type');

        if(isValid){
            uploadError = null;
        }

        cb(uploadError,'public/uploads')
    },
    filename:function(req,file,cb){
        const fileName = file.originalname.split(' ').join('-');
        const extension = FILE_TYPE_MAP[file.mimetype];
        cb(null,`${fileName}-${Date.now()}.${extension}`)
    }
})

const uploadOptions = multer({storage: storage});

router.get('/',async (req,res)=>{
    let filter ={};

    if(req.query.categories){
        filter = {category: req.query.categories.split(',')};
    }

    const productList = await Product.find(filter).populate('category'); //select('name description image');
    if(!productList){
        return res.status(500).json({
            success:false
        });
    }
    res.send(productList);
});


router.post('/', uploadOptions.single('image'), async (req,res)=>{
    const category = await Category.findById(req.body.category);
    if(!category){
        return res.status(400).json({
            success: false,
            message: 'invalid category',
        });
    }
    const file = req.file
    if(!file){
        return res.status(400).json({
            success: false,
            message: 'No image inserted',
        });
    }
    const fileName = req.file.filename;
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads`;
    let product = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: `${basePath}/${fileName}`,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        isFeatured:req.body.isFeatured,
    });
    product = await product.save();
    if(!product){
        res.status(500).json({
            success:false,
            message: 'Unable to create product'
        });
        
    }
    res.json(product);
});

router.put('/:id',async (req,res)=>{
    if(!mongoose.isValidObjectId(req.params.id)){
        res.status(400).json({
            success:false,
            message:"Invalid product id"
        })
    }
    const category = await Category.findById(req.body.category);
    if(!category){
        return res.status(400).json({
            success: false,
            message: 'invalid category',
        });
    }
    let product = await Product.findByIdAndUpdate(req.params.id,
        {
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: req.body.image,
            brand: req.body.brand,
            price: req.body.price,
            category:req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            isFeatured:req.body.isFeatured,
        },{new:true});
    if(!product){
        return res.status(400).json({
            success: false,
            message: 'Failed to update product',
        });
    }
    
    res.json(product);
});


router.get('/:id',async (req,res)=>{
    const product = await Product.findById(req.params.id).populate('category');
    if(!product){
        return res.status(404).json({
            success:false,
            message:"Product not found"
        });
    }
    res.send(product);
});

router.delete('/:id',(req,res)=>{
    if(!mongoose.isValidObjectId(req.params.id)){
        res.status(400).json({
            success:false,
            message:"Invalid product id"
        })
    }
    Product.findByIdAndDelete(req.params.id).then(product=>{
        if(product){
            res.status(200).json({
                success:true,
                message: 'Successfully deleted',
            })
        } else {
            res.status(404).json({
                success:false,
                message: 'Product not found',
            })
        }
    }).catch(err=>{
        res.status(400).json({
            success:false,
            error: err
        });
    })
});

router.get(`/get/count`, async(req,res)=>{
    const productCount = await Product.countDocuments((count)=>count);
    if(!productCount){
        res.status(500).json({success:false})
    }

    res.json({
        count: productCount
    })
});

router.get(`/get/featured/:count`, async(req,res)=>{
    const count =  (req.params.count) ? req.params.count : 0;
    console.log(typeof req.params.count);
    const products = await Product.find({isFeatured:true}).populate('category').limit(+count);
    if(!products){
        res.status(500).json({success:false})
    }

    res.json(products)
});

router.put('/gallery-images/:id', uploadOptions.array('images',10), async (req,res)=>{
    if(!mongoose.isValidObjectId(req.params.id)){
        res.status(400).json({
            success:false,
            message:"Invalid product id"
        })
    }

    const files = req.files;
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads`;
    let imagesPaths = [];
    if(files){
        files.map(file =>{
            imagesPaths.push(`${basePath}/${file.filename}`);
        })
    }

    const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
            images: imagesPaths
        },
        {new: true}
        );

    if(!product){
        return res.status(400).json({
            success: false,
            message: 'Failed to update product',
        });
    }

    res.json(product);
});

module.exports = router;