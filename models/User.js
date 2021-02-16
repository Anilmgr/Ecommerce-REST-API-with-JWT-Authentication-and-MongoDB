const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name:{
        type:String,
        required: true,
    },
    email:{
        type:String,
        required: true,
    },
    passwordHash:{
        type:String,
        required: true,
    },
    phone:{
        type:String,
        required:true,
    },
    isAdmin:{
        type: Boolean,
        default:false,
    },
    district:{
        type:String,
        default:''
    },
    province:{
        type:String,
        default:''
    },
    country:{
        type:String,
        default:''
    }

});

userSchema.virtual('id').get(function(){
    return this._id.toHexString();
});

userSchema.set('toJSON',{
    virtuals:true
})

exports.User = mongoose.model('User',userSchema);