// import cookieParser from 'cookie-parser';
// import express from 'express';
// import cors from 'cors';
// import connectDB from './configs/db.js';
// import 'dotenv/config'
// import userRouter from './routes/userRoute.js';
// import sellerRouter from './routes/sellerRoute.js';
// import connectCloudinary from './configs/cloudinary.js';
// import productRouter from './routes/productRoute.js';
// import cartRouter from './routes/cartRoute.js';
// import addressRouter from './routes/addressRoute.js';
// import orderRouter from './routes/orderRoute.js';
// import { stripeWebhooks } from './controllers/orderController.js';


// // Created an app using express package
// const app = express();

// // The port to run our backend/app
// const port = process.env.PORT;

// await connectDB()
// await connectCloudinary()

// // Allow Multiple Origins
// const allowedOrigins = ['http://localhost:5173', 'https://smartmart-m082.onrender.com']





// // Middleware Configuration
// app.use(cors({
//     origin: allowedOrigins, 
//     credentials: true
// }));

// // ✅ Allow OPTIONS preflight
// app.options('*', cors({
//   origin: allowedOrigins,
//   credentials: true
// }));

// app.post('/stripe', express.raw({type: 'application/json'}), stripeWebhooks)

// app.use(express.json());    // All the requests coming to the server will be parsed through the json method
// app.use(cookieParser());



// // To check if the API is working or not
// app.get('/', (req, res) => res.send("API is Working"))

// // For User routes
// app.use('/api/user', userRouter)
// // For Seller routes
// app.use('/api/seller', sellerRouter)
// // For Product routes
// app.use('/api/product', productRouter)
// // For Cart routes
// app.use('/api/cart', cartRouter)
// // For Address routes
// app.use('/api/address', addressRouter)
// // For Order routes
// app.use('/api/order', orderRouter)

// // To start the app
// app.listen(port,()=>{
//     console.log(`Server is runnning on http://localhost:${port} 🛜`)
// })


import cookieParser from 'cookie-parser';
import express from 'express';
import cors from 'cors';
import connectDB from './configs/db.js';
import 'dotenv/config'
import userRouter from './routes/userRoute.js';
import sellerRouter from './routes/sellerRoute.js';
import connectCloudinary from './configs/cloudinary.js';
import productRouter from './routes/productRoute.js';
import cartRouter from './routes/cartRoute.js';
import addressRouter from './routes/addressRoute.js';
import orderRouter from './routes/orderRoute.js';
import { stripeWebhooks } from './controllers/orderController.js';


// Created an app using express package
const app = express();

// The port to run our backend/app
const port = process.env.PORT;

await connectDB()
await connectCloudinary()

// Allow Multiple Origins
const allowedOrigins = ['http://localhost:5173']





// Middleware Configuration
app.use(cors({
    origin: allowedOrigins, 
    credentials: true
}));

app.use(express.json());    // All the requests coming to the server will be parsed through the json method
app.use(cookieParser());

app.post('/stripe', express.raw({type: 'application/json'}), stripeWebhooks)

// To check if the API is working or not
app.get('/', (req, res) => res.send("API is Working"))

// For User routes
app.use('/api/user', userRouter)
// For Seller routes
app.use('/api/seller', sellerRouter)
// For Product routes
app.use('/api/product', productRouter)
// For Cart routes
app.use('/api/cart', cartRouter)
// For Address routes
app.use('/api/address', addressRouter)
// For Order routes
app.use('/api/order', orderRouter)

// To start the app
app.listen(port,()=>{
    console.log(`Server is runnning on http://localhost:${port} 🛜`)

})





