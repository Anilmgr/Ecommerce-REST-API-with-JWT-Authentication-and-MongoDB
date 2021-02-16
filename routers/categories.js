const {Category} = require('../models/Category');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

router.get('/', async (req,res)=>{
    // const count = await Category.countDocuments((count)=>count); count number of items
    // console.log(count);
    const categoryList = await Category.find();
    
    if(!categoryList){
        res.status(500).json({
            success:false
        })
    }
    res.json(categoryList);
})

router.get('/:id', async (req,res)=>{
    const category = await Category.findById(req.params.id);
    
    if(!category){
        return res.status(404).json({
            success:false,
            message:'Category not found',
        })
    }
    res.json(category);
})

router.post('/',  async (req,res)=>{
    let category =  new Category({
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color
    });

   category= await category.save();

   if(!category){
       return res.status(400).json({
           success:false
       })
   }
    
    res.json(category);
});

router.put('/:id', async (req,res)=>{
    if(!mongoose.isValidObjectId(req.params.id)){
        res.status(400).json({
            success:false,
            message:"Invalid product id"
        })
    }
    let category = await Category.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            icon: req.body.icon,
            color: req.body.color
        },
        {new:true});

        if(!category){
           return res.status(400).json({
                success:false
            })
        }   
    res.json(category);
})

router.delete('/:id',(req,res)=>{
    Category.findByIdAndRemove(req.params.id).then(category=>{
        if(category){
            res.status(200).json({
                success:true,
                message: 'Successfully deleted',
            })
        } else {
            res.status(404).json({
                success:false,
                message: 'Category not found',
            })
        }
    }).catch(err=>{
        res.status(400).json({
            success:false,
            error: err
        });
    })
})

module.exports = router;