const { GetUserIdFromCookie } = require('../Helper/Utils')

const getUserIdFromCookie = (req, res, next) => {
    console.log("dekhoo", req.body)
    const userId = GetUserIdFromCookie(req.cookies.token);
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized request, please sign-in again', success: false });
    }
    req.userId = userId;
    next();
};


module.exports = { getUserIdFromCookie }