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
        const { items } = req.body;

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: (items || [{ name: 'Apex Store Product', price: 29.99 }]).map(item => ({
                price_data: {
                    currency: 'pkr',
                    product_data: { name: item.name },
                    unit_amount: Math.round(item.price * 100), // Amount in cents
                },
                quantity: item.quantity || 1,
            })),
            mode: 'payment',
            success_url: 'https://apex-store-efe161.netlify.app/?success=true',
            cancel_url: 'https://apex-store-efe161.netlify.app/?canceled=true',
        });

        res.json({ url: session.url });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Backend Server Running on Port ${PORT}`));