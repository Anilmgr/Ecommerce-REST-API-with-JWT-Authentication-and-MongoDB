const {Order} = require('../models/Order');
const {OrderItem} = require('../models/OrderItem')
const express = require('express');
const router = express.Router();

router.get('/', async (req,res)=>{
    const orderList = await Order.find().populate('user','name email');
    
    if(!orderList){
        res.status(500).json({
            success:false
        })
    }
    res.json(orderList);
});

router.get('/:id', async (req,res)=>{
    const order = await Order.findById(req.params.id)
                            .populate('user','name email')
                            .populate({
                                path:'orderItems',populate:{
                                    path:'product', populate:'category'
                                }
                            });

    if(!order){
        res.status(500).json({
            success:false
        })
    }
    res.json(order);
});


router.post('/',  async (req,res)=>{
    const orderItemsIdsPromise = Promise.all(req.body.orderItems.map(async orderItem =>{
        let newOrderItem = new OrderItem({
            quantity:orderItem.quantity,
            product:orderItem.product
        })

        newOrderItem = await newOrderItem.save();
        return newOrderItem._id;
    }));
    const orderItemsIds = await orderItemsIdsPromise;
    const totalPrices = await Promise.all(orderItemsIds.map(async (orderItemId)=>{
        const orderItem = await OrderItem.findById(orderItemId).populate('product','price');
        const totalPrice = orderItem.product.price * orderItem.quantity;
        return totalPrice;
    }));

    const totalPrice = totalPrices.reduce((a,b)=>a+b,0);

    let order =  new Order({
        orderItems: orderItemsIds,
        shippingAddress: req.body.shippingAddress,
        phone: req.body.phone,
        totalPrice: totalPrice,
        user: req.body.user
    });

    order= await order.save();

    if(!order){
        return res.status(400).json({
            success:false
        })
    }

    res.json(order);
});

router.put('/:id', async (req,res)=>{
    let order = await Order.findByIdAndUpdate(
        req.params.id,
        {
            status: req.body.status,
        },
        {new:true});

    if(!order){
        return res.status(400).json({
            success:false
        })
    }
    res.json(order);
});

router.delete('/:id',(req,res)=>{
    Order.findByIdAndRemove(req.params.id).then(async order=>{
        if(order){
            await order.orderItems.map(async orderItem =>{
                await OrderItem.findByIdAndRemove(orderItem);
            })
            res.status(200).json({
                success:true,
                message: 'Successfully deleted',
            })
        } else {
            res.status(404).json({
                success:false,
                message: 'Order not found',
            })
        }
    }).catch(err=>{
        res.status(400).json({
            success:false,
            error: err
        });
    })
})

router.get('/get/totalsales', async(req,res)=>{
    const totalSales = await Order.aggregate([
        { $group: {_id: null,totalsales: { $sum : '$totalPrice' }}}
    ])
    if(!totalSales){
        return res.status(400).json({
            success:false,
            message:'Order sales cannot be generated.'
        })
    }

    res.status(200).json({
        totalsales: totalSales.pop().totalsales
    })
})

router.get(`/get/count`, async(req,res)=>{
    const orderCount = await Order.countDocuments((count)=>count);
    if(!orderCount){
        res.status(500).json({success:false})
    }

    res.json({
        count: orderCount
    })
});

router.get(`/get/userorders/:userid`, async (req,res)=>{
    const userOrderList = await Order.find({user: req.params.userid}).populate({
                                path:'orderItems',populate:{
                                    path:'product', populate:'category'
                                }
                            });

    if(!userOrderList){
        res.status(500).json({
            success:false
        })
    }
    res.json(userOrderList);
});

module.exports = router;