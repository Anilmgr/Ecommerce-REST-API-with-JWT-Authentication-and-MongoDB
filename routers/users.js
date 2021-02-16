const {User} = require('../models/User');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

router.get('/',async (req,res)=>{
    const userList = await User.find().select('-passwordHash');
    if(!userList){
        res.status(500).json({
            success:false
        });
    }
    res.send(userList);
})

router.get('/:id',async (req,res)=>{
    const user = await User.findById(req.params.id).select('-passwordHash');;
    if(!user){
        return res.status(404).json({
            success:false,
            message: 'user not found'
        });
    }
    res.send(user);
})

router.post('/', async (req,res)=>{
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password,10),
        phone:req.body.phone,
        isAdmin:req.body.isAdmin,
        district:req.body.district,
        province:req.body.province,
        country:req.body.country,
    });

    user = await user.save();

    
   if(!user){
        return res.status(400).json({
            success:false,
            message: 'Failed to create user'
        });
    }
});

router.put('/:id', async (req,res)=> {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product id"
            })
        }
        try {
            let user = await User.findByIdAndUpdate(req.params.id, {
                name: req.body.name,
                email: req.body.email,
                passwordHash: bcrypt.hashSync(req.body.password, 10),
                phone: req.body.phone,
                isAdmin: req.body.isAdmin,
                district: req.body.district,
                province: req.body.province,
                country: req.body.country,
            }, {new: true});

            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: 'Failed to update user'
                })
            }
            res.json(user);
        } catch (e) {
            return res.status(500).json({
                success: false,
                message: 'An error occured'
            })
        }
    }
);

    router.post('/login', async (req,res)=>{
        const user = await User.findOne({email: req.body.email});
        const secret =  process.env.JWT_SECRET;

        if(!user){
            return res.status(400).json({
                success:false,
                message:'User not found',
            })
        }

        if(user && bcrypt.compareSync(req.body.password,user.passwordHash)){
            const token = jwt.sign({
                    userId:user.id,
                    isAdmin: user.isAdmin
                },
                secret,
                {expiresIn: '1d'}
                )
            return res.status(200).json({success:true, user: user.email, authToken: token})
        } else {
            return res.status(400).json({success:false,message:'Invalid Password'});
        }
        res.status(200).send(user);
    });

module.exports = router;