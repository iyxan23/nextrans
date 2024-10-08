## API Design Plans

Nextrans API design is highly influenced with other database APIs like prisma or drizzle,
which works by the user instantiating an object, exporting it as a global object, then
use it there.

It's a bit annoying that midtrans has multiple ways of doing transactions. Like, the fact
that SNAP can be done in 3 ways: Redirect, Embedded, and Page. Not to mention the Core API
that essentially provides barebones functionality for us to fully custom about what we wanted
to do.

### Nextrans Global

`server/nextrans.ts`

```ts
import "server-only"; // really make sure!!

import env from "@/env"; // or something

export const nextrans = Nextrans({
  sandbox: {
    serverKey: env.SANDBOX_ACCES_KEY,
  },
  environment: "sandbox",
});

export const snap = nextrans.snap();
```

### Payment Notification URL

`api/midtrans/snap/route.ts`

```ts
import { fetchHandler } from "@nextrans/server/snap/notification/adapter/fetchHandler";
import { nextrans } from "@/server/nextrans";

const handle = nextrans.snap.createNotificationHandler(
  fetchHandler({
    // ... config

    // payment here is a parsed custom type
    onPayment: async (payment) => {},

    // when the request coming in is invalid (wrong creds or perhaps midtrans changed their schema)
    onInvalid: async (request, error) => {
      // either someone tried faking midtrans or midtrans messed up
    },
  }),
);

export { handle as POST };
```

### Trigger Payment

`api/buy/route.ts`

```ts
import { nextrans } from "@/server/nextrans";

export async function POST(req: NextRequest): Promise<NextResponse> {
  // ... other stuff

  const transaction = await nextrans.snap.createTransaction(
    new Transaction()
      .setCustomer({ ... })
      .setBillingAddress({ ... })
      .addItem({ ... })
      .addItem({ ... })
      .build()
  );

  // insert transaction into db
  await db.insert(transaction).values({
    token: transaction.token,
    // ...
  });

  // ... other stuff
}
```

### Tests and stuff

Of course we wan't the APIs to be able to be tested. So we'd need to be able to
substitute the API-calling backend to be a mock. Something like DI could work.
