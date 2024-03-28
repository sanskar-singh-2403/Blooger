const mongoose = require("mongoose");
const {Schema, model} = mongoose;

const UserSchema = new Schema({
    username:{
        type: String,
        min: 4,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    }
})

const UserModel = model("User", UserSchema);
module.exports = UserModel;
