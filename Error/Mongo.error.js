function MongoDuplicateKeyError(error, res, FeildName) {
    console.log(error)
    let key = Object.keys(error.keyValue)[1];
    if (FeildName) {
        return res.status(400).json({ success: false, message: "Try again", errors: 'Duplicate key error' });
    }
    // the if condition is if the code randomly genreated gets same for two Feilds so to regenerate one more time 
    let message = `${key} already exists.`;
    return res.status(400).json({ success: false, message, errors: 'Duplicate key error' });
}


function MongoValidationError(error, res) {
    // console.log(error)
    const validationErrors = Object.values(error.errors).map((val) => val.message);
    console.log(validationErrors)
    return res.status(400).json({ success: false, message: validationErrors[0], errors: 'Validation error' });
}


module.exports = { MongoDuplicateKeyError, MongoValidationError }