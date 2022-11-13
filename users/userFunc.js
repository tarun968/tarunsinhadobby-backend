const UserModel = require('./userDB')
const formidable = require('formidable')
const _ = require('lodash')
const fs = require('fs')

exports.getUser = (req, res, next, id) => {
    UserModel.findById(id).exec((err, user) => {
        if (err || !user) {
            console.log("error is here 1", err)
            return res.status(400).json({
                error: "No user found in Db"
            })
        }
        req.profile = user;
        next()
    })
}
exports.SubmitForm = (req, res) => {
    let form = new formidable.IncomingForm()
    form.keepExtensions = true

    form.parse(req, (err, fields, file) => {
        if (err) {
            return res.status(400).json({
                error: 'Problem in the image'
            })
        }
        console.log(fields,Number(fields.priceImage))
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

exports.getAllImages = async (req, res) => {
    const x = await UserModel.findOne({ _id: req.auth._id })
    if (!x) {
        return res.json({ error: 'Error in the database' })
    }
    return res.json({
        message: x.ImageProduct
    })
}


exports.getSpecifiedImages = async (req, res) => {
    const filters = req.query;
    console.log(filters)
    const DesiredUser = await UserModel.findOne({ _id: req.auth._id, Name: req.auth.Name })
    if (req.query.imageName.length === 0) {
        return res.json({ message: DesiredUser.ImageProduct });
    }
    const FilteredImages = await DesiredUser.ImageProduct.filter(user => {
        let isValid = true;
        for (key in filters) {
            console.log('key', key)
            console.log(key, user[key], filters[key]);
            isValid = isValid && user[key] == filters[key];
        }
        return isValid;
    });
    if (FilteredImages.length === 0) {
        return res.json({ message: DesiredUser.ImageProduct });
    }
    return res.json(FilteredImages);
}

exports.getSpecifiedImagesByPrice = async (req, res) => {
    const filters = req.query;
    console.log(filters)
    const DesiredUser = await UserModel.findOne({ _id: req.auth._id, Name: req.auth.Name })
    if (req.query.priceImage.length === 0) {
        return res.json({ message: DesiredUser.ImageProduct });
    }
    const FilteredImages = await DesiredUser.ImageProduct.filter(user => {
        let isValid = true;
        for (key in filters) {
            console.log('key', key)
            console.log(key, user[key], Number(filters[key]));
            isValid = isValid && user[key] == Number(filters[key]);
        }
        return isValid;
    });
    console.log(FilteredImages.length)
    if (FilteredImages.length === 0) {
        console.log(FilteredImages.length)
        return res.json({ message: DesiredUser.ImageProduct });
    }
    if (FilteredImages.length === 1) {
        return res.json(FilteredImages);
    }
    return res.json({message:FilteredImages});
}


exports.getPhoto = async (req, res, next) => {

    const imagesarray = await UserModel.find({
        _id: req.profile._id
    },
        {
            ImageProduct: {
                "$elemMatch": {
                    _id: req.params.image
                }
            }
        })
    if (imagesarray) {

        res.set('Content-Type', imagesarray[0].ImageProduct[0].contentType)
        res.send(imagesarray[0].ImageProduct[0].data)
    }
    next();
}

exports.getImageOne = (req, res, next, id) => {
    console.log('id of image', id)
    UserModel.findOne({ _id: req.params.user }).exec((err, founded) => {
        if (err) {
            return res.json({ error: 'No user found ' })
        }
        req.Images = founded.ImageProduct
        next();
    })
}