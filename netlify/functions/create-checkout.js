const Stripe = require("stripe");

exports.handler = async function (event) {
  // Sécurité : méthode POST uniquement
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { amount, orderSummary } = JSON.parse(event.body);

    // Validation : montant entre 5€ et 500€
    if (!amount || amount < 500 || amount > 50000) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Montant invalide" }),
      };
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "Oh! Mikaté — Commande de beignets",
              description: orderSummary || "Commande personnalisée",
            },
            unit_amount: amount, // montant en centimes, ex: 1200 = 12,00€
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      // Remplacez YOUR_GITHUB_PAGES_URL par votre vraie URL
      success_url: process.env.SITE_URL + "?success=true",
      cancel_url: process.env.SITE_URL,
      locale: "fr",
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: session.url }),
    };
  } catch (err) {
    console.error("Stripe error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Erreur serveur : " + err.message }),
    };
  }
};
