---
layout: default
title: Introduction
nav_order: 1
---

# HTTP Message Signatures

This library provides a simple way to implement the
[IETF HTTP Message Signatures draft standard](https://www.ietf.org/archive/id/draft-ietf-httpbis-message-signatures-16.html)
for signing and verifying the integrity and authenticity of HTTP requests and responses.

HTTP Message Signatures provide a secure way to ensure that HTTP messages exchanged between clients and servers are
authentic and have not been tampered with during transit.

The library does not provide any cryptographic functionality, but instead relies on the user to provide `Signer` and
`Verify` callback functions for signing and verifying messages, respectively. This allows you to choose your preferred
cryptographic library and signing algorithm.

This library can be used both in Node.js and the browser, and the documentation provides platform-specific examples for
each environment.

## Features

- Sign HTTP requests and responses
- Verify signed HTTP requests and responses
- Support for custom `Signer` and `Verify` callback functions
- Support for various components in the signature, including special components and headers
- Browser and Node.js compatibility

## LTO client library

This library integrates out of the box with [@ltonetwork/lto](https://github.com/ltonetwork/lto-api.js). When using the
LTO client library, it's not necessary to provide a `Signer` or `Verify` callback function. The `sign` and `verify`
functions will automatically accept an LTO account to sign and an LTO client to verify messages.

## Table of Contents

1. [Installation](installation.md)
2. [Signing](signing/index.md)
    - [Signing in Node.js](signing/nodejs.md)
    - [Signing in the Browser](signing/browser.md)
3. [Verification](verification/index.md)
    - [Verification in Node.js](verification/nodejs.md)
    - [Verification in the Browser](verification/browser.md)
4. [Accept-Signature](accept-signature.md)
5. [API Reference](api-reference.md)

[![LTO Network](https://user-images.githubusercontent.com/100821/230902149-bff231ac-125e-46a3-b318-4f0021d8662d.png)](https://ltonetwork.com)
