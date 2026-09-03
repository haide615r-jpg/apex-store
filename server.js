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
        console.log("Request received with body:", req.body);
        
        // Agar frontend se items aayein hain toh unhein use karo, warna default product rakho
        const cartItems = (req.body && req.body.items && req.body.items.length > 0) 
            ? req.body.items 
            : [{ name: 'Apex Store Product', price: 29.99, quantity: 1 }];

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: cartItems.map(item => ({
                price_data: {
                    currency: 'usd',
                    product_data: { 
                        name: item.name || 'Apex Store Product' 
                    },
                    // Yeh line cart ya product ki real price ko dynamically cents mein convert karegi
                    unit_amount: Math.round(Number(item.price || 29.99) * 100),
                },
                quantity: Number(item.quantity || 1),
            })),
            mode: 'payment',
            success_url: 'https://apex-store-efe161.netlify.app/?success=true',
            cancel_url: 'https://apex-store-efe161.netlify.app/?canceled=true',
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error("CRITICAL STRIPE ERROR:", error.message);
        res.status(500).json({ error: error.message });
    }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Backend Server Running on Port ${PORT}`));