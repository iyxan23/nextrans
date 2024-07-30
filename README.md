<h1 align=center><pre>nextrans</pre></h1>

A typescript-first midtrans client implementation to better integrate Next.js applications.

## Status

`nextrans` is in development, and will probably not be ready in production use in the near
future.

## Goals

 - TypeScript-first in any aspect.
 - Use modern libraries and techniques.
 - Make integrating midtrans a breeze for NextJS projects.
 - Abstract away the complexities of the midtrans APIs.

## Background

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

## Contributing

Any contributions are welcome and highly appreciated! :)

## License

The project is FLOSS, anyone can do anything with it as long as it adheres to the
[GNU General Public License v3.0](https://opensource.org/license/gpl-3-0).
