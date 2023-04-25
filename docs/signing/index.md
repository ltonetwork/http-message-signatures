---
layout: default
title: Signing
nav_order: 2
has_children: true
---

# Signing

The `sign()` function adds the `Signature` and `Signature-Input` headers to an HTTP request or response, ensuring
integrity and authenticity of the data sent between clients and servers.

The `Signature` header contains the signature of the HTTP message, and the `Signature-Input` header contains the
components that were used to generate the signature.

## Signer

This library does not provide any cryptographic functionality. Instead, it relies on a `Signer` object to sign the HTTP
message. The `Signer` object must have the following properties:

- `keyid`: A unique identifier for the key used to sign the message
- `alg`: The algorithm used to sign the message
- `sign`: A function that takes a `string` and returns an `Uint8Array` containing the signature

The verifier should be able to use the `keyid` to retrieve the public key used to verify the signature.

### Example

```javascript
import { sign } from '@ltonetwork/http-message-signatures';

const signer = { 
  keyid: 'test-key',
  alg: 'hmac-sha256',
  sign: (data) => {
    // ... Sign the data using your preferred cryptographic library
  }
};

const request = {
  method: 'POST',
  url: 'https://example.com/api/data',
  headers: {
    'Content-Type': 'application/json',
    'Digest': 'sha-256=base64encodeddigest',
  }
};

(async () => {
    const signedRequest = await sign(request, { signer });
    // ... Send the signed request to the server
})();
```

The signed request will now have the following headers:

```
Signature-Input: sig1=("@method","@path","@authority","content-type","digest"); keyid="test-key"; created=1625653823
Signature: sig1=:base64signature:
```

For platform-specific examples on how to sign HTTP messages, refer to the following guides:

- [Signing in Node.js](signing/nodejs.md)
- [Signing in the Browser](signing/browser.md)
- [Signing with the LTO Client](signing/lto.md)

## Components

Components are parts of the message that are included in the signature. Only the components that are included in the
signature can be modified without invalidating the signature.

If a component is not included in the signature, it can be modified without a problem. If a header is explicitly left
out, it should also be a component; otherwise, it can be added without signature verification failing.

### Special Components

The components that can be signed include special components starting with an `@` symbol. The supported special
components are:

- `@method`: HTTP request method
- `@path`: HTTP request path
- `@query`: HTTP request query string
- `@authority`: HTTP request authority (host and port)
- `@status`: HTTP response status code
- `@scheme`: HTTP request scheme (e.g., 'http' or 'https')

Note that the `@query-params` and `@request-response` components are not supported in this library.

### Header Components

Any header can be included in the signature. The header name must be included in the signature, and the header value
must be included in the signature. The header name is case-insensitive, but the header value is case-sensitive.

Common headers that are included in the signature are:

- `content-type`
- `content-length`
- `digest`

### Example

```javascript
const components = ['@method', '@path', '@authority', 'content-type', 'digest'];

(async () => {
  const signedRequest = await sign(request, { signer, components });
  // ... Send the signed request to the server
})();
```

## Expiration time

HTTP Message Signatures have metadata properties that provide information regarding the signature's generation and
verification. These properties are included in the `Signature-Input` header, and are separated by semicolons.

The following parameters are supported:

* `keyid`: A unique identifier for the key used to sign the message.
* `created`: Creation time. This defaults to the current time.
* `expires`: . By default, the signature never expires.
* `nonce`: A random unique value generated for this signature value.
* `tag`: An application-specific tag for the signature. This value is used by applications to help identify signatures
* relevant for specific applications or protocols.

In addition to these, custom parameters will also be included in the `Signature-Input` header. A parameter value must be
a string, number, date, or boolean.

## Digest

To secure the integrity of the HTTP message body, you can use the
[`Digest` header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Digest). This header contains a hash of the
message body.

Before signing the HTTP message, you'll need to create the digest and add it to the request or response
headers. To create a Digest header using the SHA-256 hashing algorithm:

* Calculate the SHA-256 hash of the message body.
* Encode the hash in Base64 format.
* Add the Digest header to the request or response headers with the format `Digest: SHA-256=<Base64EncodedHash>`.

After adding the `Digest` header to the HTTP message, include the digest component when signing the message. This ensures
the integrity of the message body, as any changes to the body will result in a different hash, causing signature verification to fail.

```
Digest: SHA-256=4VYMyeX0tNLQ7opuAJeMECP3HgfLswAG3n+IqQprO0Q=
```

### Content-Digest

The `Content-Digest` header is defined in the [draft-ietf-httpbis-digest-headers-11](https://www.ietf.org/archive/id/draft-ietf-httpbis-digest-headers-11.html),
which aims to obsolete the current RFC 3230 standard, which defines the `Digest` header.

It serves a similar purpose as the `Digest` header for message integrity. However, since the draft has not yet become an
official standard, this guide uses the `Digest` header for broader compatibility and adherence to the currently
established standard.

Even though the standard is still a draft, you may use the `Content-Digest` header instead of the `Digest` header if you
prefer.

```
Content-Digest: sha-256=:4VYMyeX0tNLQ7opuAJeMECP3HgfLswAG3n+IqQprO0Q=:
```
