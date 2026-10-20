import Stripe from 'stripe'
import mongoose from 'mongoose'
import Transaction from '../models/Transaction.js';
import User from '../models/user.js';

const getStripe = () => {
    const key = process.env.STRIPE_PRIVATE_KEY
    if (!key) throw new Error('Stripe is not configured (STRIPE_PRIVATE_KEY missing)')
    return new Stripe(key)
}

// Credits the purchased transaction exactly once. Missing/foreign/already
// paid sessions are acknowledged so Stripe stops retrying them.
const fulfillTransaction = async (session) => {
    const { transactionId, appId } = session?.metadata || {}

    if (appId !== 'Chaty' || !transactionId || !mongoose.isValidObjectId(transactionId)) {
        console.log('Ignored webhook session:', { appId, transactionId })
        return
    }

    const transaction = await Transaction.findOne({ _id: transactionId, isPaid: false })
    if (!transaction) {
        console.log('Transaction already paid or not found:', transactionId)
        return
    }

    await User.updateOne({ _id: transaction.userId }, { $inc: { credits: transaction.credits } })

    transaction.isPaid = true;
    await transaction.save();
}


export const stripeWebhooks = async (req,res) =>{
    const stripe = getStripe()
    const sig = req.headers["stripe-signature"]

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET)

    } catch (error) {
        return res.status(400).send(`Webhook Error: ${error.message}`)
    }


    try {
        switch (event.type) {
            case "checkout.session.completed":{
                await fulfillTransaction(event.data.object)
                break;
            }
            case "payment_intent.succeeded":{
                const paymentIntent = event.data.object;
                const sessionList = await stripe.checkout.sessions.list({
                    payment_intent: paymentIntent.id,
                })

                const session = sessionList.data[0];
                if (!session) {
                    console.log('No checkout session found for payment intent:', paymentIntent.id)
                    break;
                }
                await fulfillTransaction(session)
                break;
            }
            default:
                console.log("Unhandled event type",event.type)
                break;
        }
        res.json({received: true})
    } catch (error) {
        console.error("Webhook processing error:",error)
        res.status(500).send("Internal Server Error")
    }
}
