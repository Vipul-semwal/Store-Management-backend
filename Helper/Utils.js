const user = require('../Models/User/User.model');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');


async function findUserByEmail(email) {
    try {
        const Finduser = await user.findOne({ email });
        return Finduser; // If user is found, it will be returned; otherwise, null
    } catch (error) {
        console.error('Error finding user:', error.message);
        throw error;
    }
}


function GenerateCode(prefix) {
    const randomDigits = crypto.randomInt(1000000, 9999999);
    return prefix + randomDigits.toString();
}


function GetUserIdFromCookie(cookie) {
    console.log('get it', cookie)

    if (!cookie) {
        return null
    }
    try {
        const decodedToken = jwt.verify(cookie, process.env.ACCESS_TOKEN_SECRET);
        console.log('ho ch=uka veiry', decodedToken)


        const userId = decodedToken.userId;

        return userId
    } catch (error) {
        console.log("jwt error", error)
        return null
    }


};


function MongoDuplicateKeyError(error, res, FeildName) {
    let key = Object.keys(error.keyValue)[0];
    // the if condition is if the code randomly genreated gets same for two Feilds so to regenerate one more time 
    let message = FeildName ? `Something went wrong please try again(duplicate id).` : `${key} already exists.`;
    return res.status(400).json({ success: false, message, errors: 'Duplicate key error' });
}


function MongoValidationError(error, res) {
    const validationErrors = Object.values(error.errors).map((val) => val.message);
    return res.status(400).json({ success: false, message: validationErrors[0], errors: 'Validation error' });
}





module.exports = { findUserByEmail, GenerateCode, GetUserIdFromCookie, MongoDuplicateKeyError, MongoValidationError }