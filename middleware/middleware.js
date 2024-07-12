const { GetUserIdFromCookie } = require('../Helper/Utils')

const getUserIdFromCookie = (req, res, next) => {
    console.log("dekhoo", req.session)
    const userId = GetUserIdFromCookie(req.session.token);
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized request, please sign-in again', success: false });
    }
    req.userId = userId;
    next();
};


module.exports = { getUserIdFromCookie }