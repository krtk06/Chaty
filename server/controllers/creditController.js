import Transaction from "../models/Transaction.js"
import Stripe from 'stripe'


const plans = [
    {
        _id: "basic",
        name: "Basic",
        price: 10,
        credits: 100,
        features: ['100 text generations', '50 image generations', 'Standard support', 'Access to basic models']
    },
    {
        _id: "pro",
        name: "Pro",
        price: 20,
        credits: 500,
        features: ['500 text generations', '200 image generations', 'Priority support', 'Access to pro models', 'Faster response time']
    },
    {
        _id: "premium",
        name: "Premium",
        price: 30,
        credits: 1000,
        features: ['1000 text generations', '500 image generations', '24/7 VIP support', 'Access to premium models', 'Dedicated account manager']
    }
]

export const getPlans = async (req, res) => {
    try {
        res.json({ success: true, plans })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

let stripeClient = null

const getStripe = () => {
    if (!stripeClient) {
        const key = process.env.STRIPE_PRIVATE_KEY
        if (!key) throw new Error('Stripe is not configured (STRIPE_PRIVATE_KEY missing)')
        stripeClient = new Stripe(key)
    }
    return stripeClient
}


export const purchasePlans = async (req, res) => {
    try {
        const { planId } = req.body
        const userId = req.user._id
        const plan = plans.find(plan => plan._id === planId)

        if (!plan) {
            return res.json({ success: false, message: "Invalid plan" })
        }

        const transaction = await Transaction.create({
            userId: userId,
            planId: plan._id,
            amount: plan.price,
            credits: plan.credits,
            isPaid: false
        })

        const origin = req.headers.origin || process.env.CLIENT_URL || 'http://localhost:5173';
        const stripe = getStripe()

        const session = await stripe.checkout.sessions.create({
            line_items: [
                {
                    price_data :{
                        currency: "usd",
                        unit_amount: plan.price*100,
                        product_data: {
                            name: plan.name
                        }
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${origin}/loading`,
            cancel_url: `${origin}`,
            metadata: {transactionId: transaction._id.toString(), appId: 'Chaty'},
            // Stripe requires at least 30 minutes; keep a safety margin for
            // the round trip so the boundary is never hit.
            expires_at: Math.floor(Date.now() /1000) + 31 * 60,
        });

        res.json({success: true,url: session.url})
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}