<h1 align=center><pre>nextrans</pre></h1>

<p align="center">
  <a href="https://github.com/iyxan23/nextrans/actions/workflows/node.js.yml">
    <img src="https://github.com/iyxan23/nextrans/actions/workflows/node.js.yml/badge.svg?event=push" alt="Node.js CI Status" />
  </a>
</p>

<p align="center">
  A modern, TypeScript-first Midtrans client designed to make payment
  integrations in Next.js applications a breeze.
</p>

---

## 🤔 Why nextrans?

`nextrans` was born out of a need for a more modern and developer-friendly way
to integrate Midtrans payments into Next.js projects. We aim to abstract away
the complexities of the Midtrans API, providing a clean, intuitive, and
type-safe library to streamline the experience of handling transactions.
So you can focus on what matters most: _your application logic_!

## 🚧 Project Status

**`nextrans` is currently in active development.**

While it's shaping up to be a powerful tool, it may not be ready for production
use just yet. We're working hard to stabilize the API and add more features.
We welcome contributors to help us get there faster!

## 🚀 Getting Started

### 1. Installation

We plan to publish `nextrans` to NPM soon. In the meantime, you can use it in
your project by adding it as a git submodule:

```bash
# Add the repository as a submodule
git submodule add https://github.com/iyxan23/nextrans.git nextrans
```

Then, include it in your `package.json` dependencies:

```json
{
  "dependencies": {
    "@nextrans/server": "./nextrans/packages/server"
  }
}
```

### 2. Configuration

First, create a global `Nextrans` instance. It's best to do this in a single
file and export it for use throughout your server-side code.

```ts
// src/lib/nextrans.ts
import { Nextrans } from "@nextrans/server";

// separate access keys for production and sandbox
let accessKeys: { serverKey: string; merchantId: string };
if (process.env.MIDTRANS_MODE === "production") {
  accessKeys = {
    serverKey: process.env.MIDTRANS_PRODUCTION_SERVER_KEY!,
    merchantId: process.env.MIDTRANS_PRODUCTION_MERCHANT_ID!,
  };
} else {
  accessKeys = {
    serverKey: process.env.MIDTRANS_SANDBOX_SERVER_KEY!,
    merchantId: process.env.MIDTRANS_SANDBOX_MERCHANT_ID!,
  };
}

export const nextrans = new Nextrans({
  accessKeys,
  mode: process.env.MIDTRANS_MODE!,
  // ^? "production" | "sandbox"
});
```

> **Note:** Remember to store your server key and merchant id securely in
> environment variables and never expose them on the client-side.

### 3. Creating a SNAP Transaction

Creating a transaction is simple and intuitive with the built-in
`TransactionBuilder`. Here's an example of how you might create a transaction
in a Next.js Route Handler:

```ts
// app/api/checkout/route.ts
import { nextrans } from "@/lib/nextrans"; // The file from the previous step
import { TransactionBuilder } from "@nextrans/server";
import { nanoid } from "nanoid";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Example validation with Zod
const Request = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  phoneNumber: z.string(),
  // ... other data you might need
});

export async function POST(req: NextRequest) {
  const payload = await Request.parseAsync(await req.json());

  const { token, redirectUrl } = await nextrans.snap.createTransaction(
    new TransactionBuilder()
      .setCustomer({
        first_name: payload.firstName,
        last_name: payload.lastName,
        email: payload.email,
        phone: payload.phoneNumber,
      })
      .setDetails({
        order_id: nanoid(), // Generate a unique order ID
        gross_amount: 50_000, // The total amount to be paid
      })
      // You can also add items, shipping details, and more!
      // .addItem({ id: 'P01', price: 50000, quantity: 1, name: 'My Product' })
      // .setShippingAddress({ ... })
      // .setBillingAddress({ ... })
      .build(),
  );

  // TODO: Store the `token` and `order_id` in your database to track the transaction.

  // Redirect the user to the Midtrans payment page
  return NextResponse.redirect(redirectUrl);
}
```

### 4. Handling SNAP Notifications

Midtrans uses webhook notifications to inform your application about transaction
events (e.g., payment success, failure, expiry). `nextrans` makes it easy to
handle these securely.

Use `nextrans.snap.createNotificationHandler` to create a Route Handler that
automatically verifies and parses incoming notifications.

```ts
// app/api/midtrans-notifications/route.ts
import { nextrans } from "@/lib/nextrans";

const handler = nextrans.snap.createNotificationHandler({
  // This function is called when a payment notification is received and verified.
  processPayment: async (notification, transaction) => {
    // `transaction` is the latest transaction status fetched from Midtrans (source of truth).
    // `notification` is the raw notification object sent by Midtrans.

    console.log(
      `Transaction ${transaction.order_id} status: ${transaction.transaction_status}`,
    );

    // TODO: Update your database based on the transaction status.
    // For example, if transaction.transaction_status is 'settlement', mark the order as paid.
  },
});

export { handler as POST };
```

> **Important:** Make sure to set your "Payment Notification URL" in your
> Midtrans dashboard to point to this endpoint (e.g., `https://your-domain.com/api/midtrans-notifications`).

## 📊 Feature Matrix

Here's a rough overview of what is planned for `nextrans`:

> Icons: 🙅 _Nothing yet_, 🚧 _Under Heavy Construction_ Unusable, 🎛️ _In Development_ Partially usable, ✅ _Done_ Stable

| Feature          | Description                                                                             | Status |
| ---------------- | --------------------------------------------------------------------------------------- | :----: |
| SNAP API         | Midtrans' API to handle transactions quickly and easily                                 |   🎛️   |
| Core API         | Midtrans' barebone API that handles transactions at a lower level                       |   🚧   |
| Payouts API      | Midtrans' disbursement API                                                              |   🙅   |
| Payment Link API | Midtrans' (Beta) API of generating secure payment links                                 |   🙅   |
| Invoicing API    | Midtrans' API to generate e-invoices                                                    |   🙅   |
| Any BI-SNAP API  | BI-SNAP (Bank Indonesia - Standar Nasional Open API Pembayaran) API exposed by Midtrans |   🙅   |

## 🤝 Want to help?

Contributions are what make the open-source community such an amazing place to
learn, inspire, and create. Any contributions you make are **greatly appreciated**!

Feel free to open an issue to discuss a new feature or bug, or submit a pull
request.

## 🙏 Acknowledgements

A huge thank you to [restuwahyu13](https.github.com/restuwahyu13) for his
[midtrans-node](https://github.com/restuwahyu13/midtrans-node) client, which
served as a great inspiration and reference for this project.

## 📜 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE)
file for details.
