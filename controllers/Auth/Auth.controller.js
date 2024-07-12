const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const user = require('../../Models/User/User.model')
const { default: mongoose } = require('mongoose');
const { findUserByEmail } = require('../../Helper/Utils')
const { Sendmail } = require('../../Services/Nodemail')
const dotenv = require("dotenv")
const shouldSendSameSiteNone = require('should-send-same-site-none');
dotenv.config()
const isProduction = process.env.NODE_ENV === 'production';
// const { GetUserIdFromCookie, GetEmployerIdFromCookie } = require('../Helper/getUserId');
async function SignUP(req, res) {
    const { firstName, email, password, } = req.body
    console.log(firstName, email, password)
    try {
        const UserCehck = await findUserByEmail(email);
        if (UserCehck) {
            return res.status(409).send({ message: "This email is already registered", success: false })
        }

        const NewUser = await user.create({
            firstName: firstName,
            email,
            password,
            provider: 'local'
        })
        const mail = await Sendmail(firstName, email, NewUser._id, process.env.verifyEmailRoute);
        console.log("mail", mail)
        if (mail === true) {
            return res.status(200).json({ message: 'account created sucessfully please check you mail for vefifaction link', data: NewUser, success: true })
        }
        else {
            const userDelete = await user.deleteOne({ _id: NewUser._id });
            return res.status(503).json({ message: "troubal sending verification email", success: false });
        }
        ;
    } catch (error) {
        if (error.name === "ValidationError") {
            const validationErrors = Object.values(error.errors).map((val) => val.message);
            console.log(validationErrors)

            return res.status(400).json({ message: validationErrors[0], success: false })
        }
        console.log(error)
        return res.status(500).json({ message: "internal server error", success: false });
    }
}

async function SignIn(req, res) {
    const { email, password } = req.body;
    const curretnUser = await user.findOne({ email });

    if (!curretnUser) {
        return res.status(404).json({ message: 'User not found', success: false });
    }

    if (!curretnUser.isVerified) {
        return res.status(401).json({ message: 'Email not verified. Please verify your email to login', success: false });
    }

    const validPassword = await bcrypt.compare(password, curretnUser.password);
    if (!validPassword) {
        return res.status(401).json({ message: 'Wrong password', success: false });
    }

    const accessToken = jwt.sign({ userId: curretnUser._id }, process.env.ACCESS_TOKEN_SECRET,);
    const refershToken = jwt.sign({ refreshToken: curretnUser._id }, process.env.REFRESH_TOKEN_SECRET);

    const cookieOptions = {
        httpOnly: true,
        secure: isProduction, // Only sent over HTTPS in production
        // ameSite: 'None'

    }
    try {
        const updatedUser = await user.findOneAndUpdate(
            { _id: curretnUser._id },
            { $set: { refershToken: refershToken } },
            { new: true }
        );

        if (updatedUser) {
            res.cookie('token', accessToken, cookieOptions);

            res.cookie('refresh-token', refershToken, cookieOptions);

            return res.status(200).json({ message: 'Successfully logged in', token: accessToken, refreshToken: refershToken, success: true });
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error', success: false });
    }
}


function logout(req, res) {
    try {
        res.cookie('token', '', { expires: new Date(0), httpOnly: true });
        res.cookie('refresh-token', '', { expires: new Date(0), httpOnly: true });
        res.clearCookie("token");
        res.clearCookie("refresh-token");


        return res.status(200).json({ message: 'Loged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        return res.status(500).json({ message: 'Failed to logout' });
    }
}


async function GoogleAUth(req, res) {
    try {
        const code = req.query.code;

        const { id_token, access_token } = await GetGoogleAuthToken(code);
        console.warn("id:", id_token, "accestoken:", access_token)

        // const googleuser = jwt.decode(id_token)
        const googleuser = await fetchGoogleUserInfo(access_token)
        console.log(googleuser);

        const employeeCehck = await findUserByEmail(googleuser.email);
        if (!employeeCehck) {
            try {
                const newEmployee = await employeeIntialdata.create({
                    firstName: googleuser.name,
                    email: googleuser.email,
                    password: googleuser.id,
                    profilePicture: googleuser.picture,
                    isVerified: true,
                    provider: "google",

                })
                return res.status(200).json({ message: "account created succesfully" })

            } catch (error) {
                console.log('while creating employee by google', error)
                throw new Error(error)
            }
        }
        else {
            return res.status(400).json({ message: 'email alreday exists' })
        }


        res.send('yooo!!')

        return res.send(error)
    }
    catch (error) {
        console.log('in error block of google auth ', error)
    }
};

async function verifyUser(req, res) {
    try {
        const { id } = req.params;

        if (!id) {
            return res.render('SignupError', { error: { message: 'Something went wrong! Please Sign Up Again', url: process.env.BACKTOHOME } });
        }

        console.log('id', id);

        // check for again validation

        const checkverifaction = await user.findOne({ _id: id });
        console.log("cehck data", checkverifaction);
        if (checkverifaction.check === true) {
            return res.render('SignupError', { error: { message: 'user already verfied', url: process.env.CLIENTHOMEURL } });
        }

        const userUpdate = await user.findByIdAndUpdate(
            { _id: id },
            { isVerified: true, check: true },
            { new: true }
        );

        if (!userUpdate) {
            return res.render('SignupError', { error: { message: 'Something went wrong! Please Sign Up Again', url: process.env.CLIENTHOMEURL } });
        }

        console.log(userUpdate)


        return res.render('SignupSucc', { data: userUpdate.firstName, url: process.env.CLIENTHOMEURL })

    } catch (error) {
        console.error(error);
        return res.render('SignupError', { error: { message: 'Something went wrong! Please Sign Up Again', url: process.env.CLIENTHOMEURL } });
    }
}

async function VerifyAuthentication(req, res) {
    console.log("token agay bhai", req.cookies.token);
    const employeeId = GetUserIdFromCookie(req.cookies.token)
    console.log(employeeId)
    if (!employeeId) {
        return res.status(401).json({ message: 'Unauthorized request' })
    }

    try {
        const user = await employeeIntialdata.findById(employeeId);
        console.log(user.ProfileCompleate)
        if (user) {
            return res.status(200).json({ ProfileCompleateness: user.ProfileCompleate })
        }
        else {
            return res.status(404)
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal Server Error" });
    }
}






module.exports = { SignIn, SignUP, logout, GoogleAUth, verifyUser, VerifyAuthentication }
