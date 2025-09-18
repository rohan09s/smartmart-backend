import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    cartItems: {type: Object, default: {} },
}, {minimize: false})
// We can create the user with an object only when we use minimize

const User = mongoose.models.user || mongoose.model('user', userSchema)


export default User;