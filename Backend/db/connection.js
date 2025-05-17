require('dotenv').config({ path: '/Users/adityajagrani/Desktop/Task_board/Backend/db/.env'});

const mongoose = require("mongoose")


const uri = process.env.MONGO_URI

mongoose.connect(uri)
.then(() => { console.log("Mongoose Connection Established")})
.catch((error) => {
    console.error("Mongoose Connection Error:", error);
});

module.exports = mongoose;