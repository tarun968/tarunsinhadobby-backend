const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const UsersDobby = new Schema({
    Name: {
        type: String,
        required: true
    },
    Email: {
        type: String,
        unique:true,
        required: true,
    },
    Password: {
        type: String,
        required:true,
    },  
    ImageProduct:[{
        imageName:{
        type:String,
        },
        priceImage:{
            type:Number,
            min:0
        },
        data:Buffer,
        contentType:String,
    }],
})

module.exports = mongoose.model("Users", UsersDobby)