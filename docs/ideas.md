# Ideas

Some ideas that'd be quite cool to be implemented, but is not a priority to be implemented.

## Secure Notification

Hardcoding notification endpoint is essentially a security-by-obscurity mechanism. There's
a chance for a bad actor to send a malicious notification if they found out the endpoint.

What if we make the endpoint to be different for each transactions?

E.g. transaction `a` would have the endpoint `/api/notifications/7Hgyw24d` and transaction
`b` would have the endpoint `/api/notifications/j8Hwgd4i`, and so on.

Reference: https://github.com/Midtrans/midtrans-nodejs-client?tab=readme-ov-file#override-http-notification-url

> But wait, the docs URL linked in README.md doesn't exist.
>
> Don't tell me they removed this and they haven't updated the client? Good god.
