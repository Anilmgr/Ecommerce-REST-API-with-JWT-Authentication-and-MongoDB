const mongoose = require('mongoose');

const orderItemSchema = mongoose.Schema({
    product:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Product',
    },
    quantity:{
        type: Number,
        required:true
    },
    createdAt:{
        type:Date,
        default: Date.now,
    },
});

orderItemSchema.virtual('id').get(function(){
    return this._id.toHexString();
});

orderItemSchema.set('toJSON',{
    virtuals:true
})

exports.OrderItem = mongoose.model('OrderItem',orderItemSchema);