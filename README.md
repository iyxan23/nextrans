<h1 align=center><pre>nextrans</pre></h1>

[![Node.js CI](https://github.com/iyxan23/nextrans/actions/workflows/node.js.yml/badge.svg?event=push)](https://github.com/iyxan23/nextrans/actions/workflows/node.js.yml)

A typescript-first midtrans client implementation to better integrate Next.js applications.

## Status

`nextrans` is in development, and will probably not be ready in production use in the near
future.

## Goals

 - TypeScript-first in any aspect.
 - Use modern libraries and techniques.
 - Make integrating midtrans a breeze for NextJS projects.
 - Abstract away the complexities of the midtrans APIs.

## How to use it?

I'm planning to publish nextrans to npmjs, but in the meantime, you could add `iyxan23/nextrans`
as a git submodule, then include it in your `package.json` as such:

```json
{
  "dependencies": {
    "@nextrans/server": "./nextrans/packages/server",
  }
}
```

To set nextrans up, create a global `Nextrans` instance in a file somewhere:

```ts
// let's say this is located within `src/app/server/nextrans.ts`
import { Nextrans } from "@nextrans/server";

export const nextrans = new Nextrans({ ... });
```

In the instantiation, include your server key and merchant ID retrieved from your Midtrans
dashboard. Preferrably through an environment variable.

```ts
// let's say this is located within `src/app/server/nextrans.ts`
import { Nextrans } from "@nextrans/server";

export const nextrans = new Nextrans({
  sandbox: {
    serverKey: process.env.MIDTRANS_SANDBOX_SERVER_KEY,
    merchantId: process.env.MIDTRANS_SANDBOX_MERCHANT_ID,
  },
  /* place in production keys when `sandbox` is "production"
  production: {
    serverKey: process.env.MIDTRANS_PRODUCTION_SERVER_KEY,
    merchantId: process.env.MIDTRANS_PRODUCTION_MERCHANT_ID,
  },
  */
  environment: "sandbox", // or "production"

  // or you could do something like
  //
  //   environment: process.env.NODE_ENV === "production" ? "production" : "sandbox"
});
```

And nextrans is set-up!

### Creating a SNAP Transaction

Creating a transaction in nextrans is straightforward. Use the built-in `TransactionBuilder`
to easily work your way through data.

Here's an example for a `route.ts` API file with `zod`:

```ts
import { nextrans } from "~/server/nextrans"; // previous file
import { type NextRequest, NextResponse } from "next/server";

const Request = z.object({
  // ...data
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  const payload = await req.json().then((j) => Request.parseAsync(j));

  const { token, redirectUrl } = await nextrans.snap.createTransaction(
    new TransactionBuilder()
       .setCustomer({
         first_name: payload.firstName,
         last_name: payload.lastName,
         email: payload.email,
         phone: payload.phoneNumber,
       })
       .setDetails({
         order_id: nanoid(),
         gross_amount: 50_000, // pay 50k
       })
       // other APIs you might be interested with:
       //
       //   .setAllItems({ ... })
       //   .addItem({ ... })
       //   .setShippingAddress({ ... })
       //   .setBillingAddress({ ... })
       //
      .build()
  );

   // store `token` somewhere in a database

   return NextResponse.redirect(redirectUrl);
}
```

### Listen to SNAP notifications

Any events related to transactions as they get created, paid, expired, or deemed as
fraud will be notified by midtrans through an endpoint you define.

Nextrans makes it easy to focus on your transactions rather than dealing with parsing
or verification.

Use `nextrans.snap.createNotificationHander` to create a route handler which you can
export as `POST` in a `route.ts` file:

```ts
// @file /app/api/midtrans/route.ts
const handler = nextrans.snap.createNotificationHandler({
  processPayment: async (notification, transaction) => {
    // use `transaction` as source of truth, `notification` is the notification itself
    // that is sent by midtrans
  }
});

export { handler as POST };
```

These are currently the only tested APIs implemented in nextrans. I have plans to
develop further by adding in core APIs and such in later releases, or when I need
to use them.

## Why does this exist?

Midtrans is an awesome platform where developers like us will never need to worry about
processing transactions in such a secure and convenient way.

It came as a surprise to me as the [official nodejs client](https://github.com/Midtrans/midtrans-nodejs-client)
was never maintained properly, still uses Javascript without type definitions despite
TypeScript being the dominant language among Next.js developers, and its terrible
integration with modern frameworks like Next.js.

It's somewhat saddening seeing the slow rate adoption of modern javascript framework
throughout Indonesia. I hope the existence of this project will better influence the
future of the web development space.

I decided to bite the dust and rewrite one from scratch by following its API docs (which if
I could critic, is really confusing to read. It's probably the most confusing API doc I've ever
read so far).

## Thanks

Huge thank you to [restuwahyu13](https://github.com/restuwahyu13) for developing and publishing a
[midtrans node server-side client](https://github.com/restuwahyu13/midtrans-node).
I had just discovered this after this whole rage happened. I'll be using this as an inspiration
and reference to extend it to be able to be used with Next.

## Want to help?

Any contributions are welcome and highly appreciated! :)

## License

The project is FLOSS, anyone can do anything with it as long as it adheres to the
[GNU General Public License v3.0](https://opensource.org/license/gpl-3-0).
