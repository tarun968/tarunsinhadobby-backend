const express = require('express')
require('dotenv').config()
const bodyParser = require('body-parser')
const cors = require('cors')
const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema
const bcrypt = require('bcrypt')
const cookieParser = require('cookie-parser')
const app = express()
const UserModel = require('./users/userDB')
// app.use(express.bodyParser());
app.use(cookieParser());
const formidable = require('formidable')
const _ = require('lodash')

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));
app.use(express.json());
app.use(cors(
    {
        origin: ['http://localhost:3000','https://tarunsinhadobbyassignment.onrender.com'],
        credentials: true,            //access-control-allow-credentials:true
        optionSuccessStatus: 200,
    }
))
const fs = require('fs')
const { resolveSrv } = require('dns')
const x = encodeURIComponent('Tarunlt@23')
const conn = `mongodb+srv://${process.env.USNAME}:${encodeURIComponent(process.env.PASSWORD)}@cluster0.umnottc.mongodb.net/?retryWrites=true&w=majority`
mongoose.connect(conn,
    { useNewUrlParser: true, useUnifiedTopology: true })
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: false }));
const Auths = require('./users/userLogin')
const { getUser, getAllImages, getSpecifiedImages,getPhoto,getImageOne, getSpecifiedImagesByPrice } = require('./users/userFunc')
const { isAuthenticated, isSignedIn } = require('./users/userAuth')

const SubmitForm = (req, res) => {
    // console.log("form ", req)

    // var decoded = jwt_decode(token);
    // console.log(decoded);

    let form = new formidable.IncomingForm()
    form.keepExtensions = true
    // console.log("form ",form,req.body)

    form.parse(req, (err, fields, file) => {
        if (err) {
            console.log("error",fields)
            console.log(err)
            return res.status(400).json({
                error: 'Problem in the image'
            })
        }
        // let User = UserModel(fields)
        // console.log('fields are', User)
        console.log('fields are', fields)
        console.log(file)
        if (file.photo) {
            if (file.ImageProduct.size > 8300000) {
                return res.status(400).json({
                    error: 'Problem in the image and its size'
                })
            }
        }
        UserModel.updateOne({ _id: req.auth._id, Name: req.auth.Name },
            {
                $push: {
                    "ImageProduct": {
                        data: fs.readFileSync(file.ImageProduct.filepath),
                        imageName: fields.imageName,
                        priceImage:Number(fields.priceImage),
                        contentType: file.ImageProduct.type
                    }
                }
            }).exec((err, upgrade) => {
                if (err) {
                    return res.json({
                        error: 'Problem in the fields'
                    })
                }
                return res.json({ message: 'done successfullly' })
            })
    })
}

app.param("user", getUser)
app.param("image",getImageOne);
// app.get("/Image/photo/:imageone",get)
app.use("/", Auths)
app.get("/Image/:user/photo/:image",getPhoto)

app.post("/add-image/:user", isSignedIn, isAuthenticated, SubmitForm)
app.get("/All-Images/:user", isSignedIn, isAuthenticated, getAllImages)
app.get("/specificimage/:user", isSignedIn, isAuthenticated, getSpecifiedImages)
app.get("/specificimagebyprice/:user", isSignedIn, isAuthenticated, getSpecifiedImagesByPrice)

app.listen(5000, () => {
    console.log("On the port 5000")
})