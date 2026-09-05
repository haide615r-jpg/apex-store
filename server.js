const express = require('express');
const cors = require('cors');
// Stripe Test Key (Demo Session ke liye)
const stripe = require('stripe')('sk_test_51UAbYTGT8MuTHLgkkYgAeV5QsEgKfilZD41PoHbK6aMEFYcZwoUTQKCvlj36KVgBpO806e26n9IbM9d4YuqEfMsa00goQDeOmK');
const { Resend } = require('resend');
const resend = new Resend('re_9sx8CbWw_7qAfL7Rbwqy6inSpbffGcSVe');
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

       let unitAmount = 29.99;
    let productName = "Apex Store Product";

    if (req.body && req.body.items && Array.isArray(req.body.items) && req.body.items.length > 0) {
        const item = req.body.items[0];
        if (item.price) unitAmount = Number(item.price);
        if (item.name) productName = item.name;
    }
        // If data came directly without 'items' wrapper
        else if (req.body && req.body.price) {
            unitAmount = Number(req.body.price);
            if (req.body.name) productName = req.body.name;
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
// Complaint & Subscription Email Endpoint
app.post('/send-complaint', async (req, res) => {
    const { name, email, message } = req.body;

    try {
        await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: 'haider65820@gmail.com',
            subject: `New Message/Complaint from ${name}`,
            text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`
        });

        await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: email,
            subject: 'We have received your message - Apex Store',
            text: `Hi ${name},\n\nThank you for reaching out! We have received your message and will get back to you soon.`
        });

        res.status(200).json({ success: true, message: "Email sent successfully!" });
    } catch (error) {
        console.error("Email error:", error);
        res.status(500).json({ success: false, error: "Failed to send email" });
    }
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));