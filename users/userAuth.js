
const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
var { expressjwt: jwtk } = require("express-jwt");
// exports.isAdmin = (req, res, next) => {
//     try {
//         console.log("is admin profile", req.profile)
//         console.log("is admin profile", req.body)
//         if (req.profile.Role != 1) {
//             return res.json({ message: 'Acess denied as you are not an admin' })
//         }
//         else {
//             next()
//         }
//     } catch (e) {
//         console.log(e)
//     }
// }
exports.isSignedIn = jwtk(
    {
        secret: process.env.SECRET,
        userProperty: "auth1",
        algorithms: ['sha1', 'HS256', 'RS256']
})
exports.isAuthenticated = (req, res, next) => {
    // console.log("req auth", req.auth)
    // console.log('req profile', req.profile)
    try {
        // console.log(req.profile._id.toString())
        // console.log("req auth is", req.auth)
        // console.log("req profile is", req.profile)
        let checker = req.profile && req.auth &&
            req.profile._id.toString() === req.auth._id
        if (!checker) {
            return res.status(403).json({
                error: "Acess is denied"
            })
        }
        next()
    } catch (er) {
        console.log("error", er)
    }
}