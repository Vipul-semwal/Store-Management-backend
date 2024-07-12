const mongoose = require('mongoose');
const dotenv = require("dotenv")
dotenv.config()
const mongooseOptions = {

};
const moongoesConnect = mongoose.connect(process.env.MONGO_CONNECTION_STRING, mongooseOptions).then(() => {
    console.log(`connected to ${process.env.MONGO_CONNECTION_STRING}`)
}).catch((err) => {
    console.log("could not connect to the database", err);
});

module.exports = moongoesConnect