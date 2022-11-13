const express = require('express')
const jwt = require('jsonwebtoken')
const router = express.Router()
const bcrypt = require('bcrypt')
var userModel = require('./userDB')
router.post('/login', async (req, res) => {
    try {
        console.log(req.body)
        const record_to_find = await userModel.findOne({ Name: req.body.Name })
        const user_found = await bcrypt.compare(req.body.Password, record_to_find.Password)
        // console.log(record_to_find, req.body)
        if (!record_to_find) {
            return res.json({ error: "No User Was Found" });
        }
        if (user_found) {

            const Token = jwt.sign(
                {
                    _id: record_to_find._id,
                    Name: req.body.Name
                }
                , process.env.SECRET)
            res.cookie("UserLoggedIN", Token);
            const { _id, Name } = record_to_find
            return res.json({ Token, user: { _id, Name } })
        }
    } catch (error) {
        console.log(error);
        res.json({ error: "Error, Kindly Login Again" })
    }
})

router.post('/signup', async (req, res) => {
    console.log(req.body);
    console.log("====================")
    try {
        const record_new = await new userModel({
            Name: req.body.Name,
            Password: await bcrypt.hash(req.body.Password, 10),
            Email: req.body.Email,
        })
        await record_new.save();
        const token = await createToken(req.body.Email);
        console.log(token);
        res.cookie("user", token, {
            httpOnly: true
        })
        return res.json({ record_new });
    }
    catch (err) {
        console.log(err)
        return res.json({ error: "Error in the SiginUp, Kindly Try again later" })
    }
})

router.post('/signout', async (req, res) => {
    console.log('res', res)
    res.clearCookie('UserLoggedIN')
    return res.json({
        Message: "Cookie Cleared"
    })
})
const createToken = async (id) => {
    const x = jwt.sign({ id: id }, process.env.SECRET)
    return x;
}

module.exports = router