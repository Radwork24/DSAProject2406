import DodoPayments from 'dodopayments';
import fs from 'fs';

const client = new DodoPayments({
  bearerToken: 'za_ISAHDCVX1EQsS.IJb3zE7ZG-dnUutQ8lkxLLh_lsAfnDXkMaRLJ-T6tc7Cxv-6',
  environment: 'test_mode',
});

async function main() {
  try {
    const p1 = await client.products.create({
      name: "1 Month Plan",
      description: "Short-term access to premium features",
      tax_category: "saas",
      price: {
          type: "one_time_price",
          price: 1500,
          currency: "USD",
          discount: 0,
          purchasing_power_parity: false,
          pay_what_you_want: false
      }
    });
    
    const p3 = await client.products.create({
      name: "3 Months Plan",
      description: "Best value for your semester",
      tax_category: "saas",
      price: {
          type: "one_time_price",
          price: 3500,
          currency: "USD",
          discount: 0,
          purchasing_power_parity: false,
          pay_what_you_want: false
      }
    });

    const p12 = await client.products.create({
      name: "12 Months Plan",
      description: "Maximum savings, ultimate access",
      tax_category: "saas",
      price: {
          type: "one_time_price",
          price: 9900,
          currency: "USD",
          discount: 0,
          purchasing_power_parity: false,
          pay_what_you_want: false
      }
    });

    console.log("SUCCESS");
    console.log(`prod_1: ${p1.product_id}`);
    console.log(`prod_3: ${p3.product_id}`);
    console.log(`prod_12: ${p12.product_id}`);
    
    fs.writeFileSync('product_ids.json', JSON.stringify({
        prod_1month: p1.product_id,
        prod_3month: p3.product_id,
        prod_12month: p12.product_id
    }));

  } catch (error) {
    console.error("Error:", error.message);
  }
}

main();
