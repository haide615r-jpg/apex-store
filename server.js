const express = require('express');
const cors = require('cors');
// Stripe Test Key (Demo Session ke liye)
const stripe = require('stripe')('sk_test_51UAbYTGT8MuTHLgkkYgAeV5QsEgKfilZD41PoHbK6aMEFYcZwoUTQKCvlj36KVgBpO806e26n9IbM9d4YuqEfMsa00goQDeOmK');

const app = express();
app.use(cors());
app.use(express.json());
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index_8.html');
});

// Stripe Checkout Session Endpoint
app.post('/create-checkout-session', async (req, res) => {
    try {
        console.log("Full Request Body Received:", JSON.stringify(req.body));
    console.log("Extracted Unit Amount:", unitAmount);
      let unitAmount = 29.99; // Fallback
    let productName = "Apex Store Product";

    if (req.body) {
        // اگر ڈیٹا 'items' نام کی ارے میں آ رہا ہے
        let rawItems = req.body.items || req.body.cart || req.body;
        if (Array.isArray(rawItems) && rawItems.length > 0) {
            const item = rawItems[0];
            if (item.price) unitAmount = Number(item.price);
            else if (item.amount) unitAmount = Number(item.amount);
            else if (item.cost) unitAmount = Number(item.cost);
            
            if (item.name) productName = item.name;
            else if (item.title) productName = item.title;
        } 
        // اگر ڈیٹا سیدھا سنگل آبجیکٹ کی شکل میں آ رہا ہو
        else if (req.body.price) {
            unitAmount = Number(req.body.price);
            if (req.body.name) productName = req.body.name;
        }
    }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: productName,
                    },
                    unit_amount: Math.round(unitAmount * 100),
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: 'https://apex-store-efe161.netlify.app/?success=true',
            cancel_url: 'https://apex-store-efe161.netlify.app/?canceled=true',
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error("STRIPE ERROR:", error.message);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));