import DodoPayments from 'dodopayments';

const client = new DodoPayments({
  bearerToken: 'za_ISAHDCVX1EQsS.IJb3zE7ZG-dnUutQ8lkxLLh_lsAfnDXkMaRLJ-T6tc7Cxv-6',
  environment: 'test_mode',
});

async function main() {
  try {
    const session = await client.checkoutSessions.create({
      // What happens if we just pass total_amount instead of product_cart? Let's try.
      // Dodo Payments docs usually require product_cart, but let's test if we can do something else.
      billing: {
        city: "NY",
        country: "US",
        state: "NY",
        street: "123",
        zipcode: "10001"
      },
      customer: {
        email: 'test@example.com',
        name: 'Test User'
      },
      product_cart: [
        {
          quantity: 1,
          amount: 1000, // $10.00
          name: "Premium Subscription", // Does this work without product_id?
        }
      ],
      return_url: 'http://localhost:5173/payment-success'
    });
    console.log("Success:", session.checkout_url);
  } catch (error) {
    console.error("Error creating session:", error.message);
  }
}

main();
