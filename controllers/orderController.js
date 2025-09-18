import Order from "../models/Order.js";
import Product from "../models/Product.js";
import stripe from 'stripe'
import User from "../models/User.js"

// Place Order COD: /api/order/cod
export const placeOrderCOD = async (req, res)=>{
    try {
        // const userId = req.user.id;
        const { userId, items, address } = req.body;

        if(!address || items.length === 0){
            return res.json({success: false, message: 'Invalid data'})
        }

        // Calculate amount using items
        let amount = await items.reduce(async (acc, item)=>{
            const product = await Product.findById(item.product);
            return (await acc) + product.offerPrice * item.quantity;
        }, 0)

        // Add 2% tax charge
        amount += Math.floor(amount * 0.02);


        await Order.create({
            userId,
            items,
            amount,
            address,
            paymentType: 'COD',
        });


        // Clear user cart in Database
        await User.findByIdAndUpdate(userId, { cartItems: {} });

        return res.json({success: true, message: 'Order Placed Successfully'})
    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
}



// Place Order Stripe: /api/order/stripe
export const placeOrderStripe = async (req, res)=>{
    try {
        // const userId = req.user.id
        const { userId, items, address } = req.body;

        const {origin} = req.headers;

        if(!address || items.length === 0){
            return res.json({success: false, message: 'Invalid data'})
        }

        let productData = [];

        // Calculate amount using items
        let amount = await items.reduce(async (acc, item)=>{
            const product = await Product.findById(item.product);
            productData.push({
                name: product.name,
                price: product.offerPrice,
                quantity: item.quantity,
            })
            return (await acc) + product.offerPrice * item.quantity;
        }, 0)

        // Add 2% tax charge
        amount += Math.floor(amount * 0.02);


        const order = await Order.create({
            userId,
            items,
            amount,
            address,
            paymentType: 'Online',
        });

        // Stripe Gateway Initialize
        const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

        // Create line items for stripe
        const line_items = productData.map((item)=>{
            return {
                price_data: {
                    currency: "usd",
                    product_data:{
                        name: item.name,
                    },
                    unit_amount: Math.floor(item.price + item.price * 0.02) * 100
                },
                quantity: item.quantity,
            }
        })

        // Create session
        const session = await stripeInstance.checkout.sessions.create({
            line_items,
            mode: "payment",
            success_url: `${origin}/loader?next=my-orders`,
            cancel_url: `${origin}/cart`,
            metadata: {
                orderId: order._id.toString(),
                userId,
            }
        }) 

        return res.json({ success: true, url: session.url })
    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
}

// Stripe Webhooks to verify Payments Action: /stripe
export const stripeWebhooks = async (req, res)=>{
    // Stripe Gateway Initialize
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY)

    const sig = req.headers["stripe-signature"]         // sig is signature

    let event;

    try {
        event = stripeInstance.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (error) {
        res.status(400).send(`Webhook Error: ${error.message}`)
    }

    // Handle the event
    switch (event.type) {
        case "payment_intent.succeeded":{
            const paymentIntent = event.data.object;
            const paymentIntentId = paymentIntent.id;

            // Getting Session Metadata
            const session = await stripeInstance.checkout.sessions.list({
                payment_intent: paymentIntentId,
            });

            const userId = session.data[0].metadata;
            const { orderId } = session.data[0].metadata;

            // Mark payment as paid
            await Order.findByIdAndUpdate(orderId, {isPaid: true})
            // Clear user cart
            await User.findByIdAndUpdate(userId, {cartItems: {} })

            break;
        }

        case "payment_intent.payment_failed":{
            const paymentIntent = event.data.object;
            const paymentIntentId = paymentIntent.id;

            // Getting Session Metadata
            const session = await stripeInstance.checkout.sessions.list({
                payment_intent: paymentIntentId,
            });

            const { orderId } = session.data[0].metadata;
            // Delete the order from the database because the payment is failed
            await Order.findByIdAndDelete(orderId)

            break;
        }
            
            
    
        default:
            console.error(`Unhandled evet type ${event.type}`)
            break;
    }
    res.json({received: true})
    
}



// Get Orders by user ID: /api/order/user
export const getUserOrders = async (req, res)=>{
    try {
        const userId = req.user.id;
        const orders = await Order.find({
            userId,
            $or: [{paymentType: 'COD'}, {isPaid: true}]
        }).populate("items.product address").sort({createdAt: -1});

        res.json({success: true, orders})
    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
}




// Get all orders for Sellers i.e. Admin: /api/order/seller
export const getAllOrders = async (req, res)=>{
    try {
        const orders = await Order.find({
            $or: [{paymentType: 'COD'}, {isPaid: true}]
        }).populate("items.product address").sort({createdAt: -1});

        res.json({success: true, orders})
    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
}