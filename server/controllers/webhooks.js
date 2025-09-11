import Stripe from 'stripe'
import Transaction from '../models/Transaction';
import User from '../models/user';


export const stripeWebhooks = async (req,res) =>{
    const stripe = new Stripe(process.env.STRIPE_WEBHOOK_SECRET)
    const sig = req.headers["stripe-signature"]

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET)

    } catch (error) {
        return res.status(400).send(`Webhook Error: ${error.message}`)
    }


    try {
        switch (event.type) {
            case "payment_intent.succeeded":{
                const payment_intent = event.data.object;
                const sessionList = await stripe.checkout.sessions.list({
                    payment_intent: payment_intent.id,
                })

                const session = sessionList.data[0];
                const {transactionId,appId} = session.metadata;

                if(appId === 'Chatyy'){
                    const transaction = await Transaction.findOne({
                        _id: transactionId,
                        isPaid: false
                    })

                    await User.updateOne({_id: transaction.userId},{$inc: {credits: transaction.credits}})

                    transaction.isPaid = true;
                    await transaction.save();
                }else{
                    return res.json({recieved: true,message: "Ignored event: Invalid App"})
                }
                break;
            }
            default:
                console.log("Unhandled event type",event.type)
                break;
        }
        res.json({recieved: true})
    } catch (error) {
        console.error("Webhook processing error:",error)
        res.status(500).send("Internal Server Error")
    }
}