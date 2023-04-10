---
layout: default
title: Signing in Node.js
parent: Signing
nav_order: 1
---

# Signing in Node.js

This guide demonstrates how to sign HTTP messages in Node.js using the native `crypto` library.

## Signer

In Node.js, you can create a `Signer` object using the native `crypto` library. The following example shows how to
create a `HmacSigner` class that implements the required properties and methods for a `Signer`.

```javascript
import crypto from 'crypto';

class HmacSigner {
  constructor(key, keyid = 'test-key', alg = 'hmac-sha256') {
    this.key = key;
    this.keyid = keyid;
    this.alg = alg;
  }

  sign(data) {
    const hmac = crypto.createHmac('sha256', this.key);
    hmac.update(data);
    return new Uint8Array(hmac.digest());
  }
}

const signer = new HmacSigner('your-secret-key');
```

Now you have a `signer` object that can be used with the `sign()` function to sign HTTP messages.

## Signing a message

To sign a request or response in Node.js, use the `sign()` function with the `HmacSigner` created above.

```javascript
import { sign } from '@ltonetwork/http-message-signatures';

const request = {
  method: 'GET',
  url: 'https://example.com/api/data',
};

(async () => {
  const signedRequest = await sign(request, { signer });
// ... Send the signed request to the server
})();
```

The signed request will now have the following headers:

```
Signature-Input: sig1=("@method","@target-uri"); keyid="test-key"; created=1625653823
Signature: sig1=:4VYMyeX0tNLQ7opuAJeMECP3HgfLswAG3n+IqQprO0Q=:
```

You can specify the components to sign using the `components` option. For more information, see
[Signing Components](/signing#components).

### Digest

To secure the integrity of the HTTP request or response body, you can use the
[`Digest` header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Digest). This header contains a hash of the
message body.

Before signing the HTTP message, you'll need to create the digest and add it to the headers. To create a Digest header
using the SHA-256 hashing algorithm and the `crypto` library:

1. Calculate the SHA-256 hash of the response body.
2. Encode the hash in Base64 format.
3. Add the Digest header to the response headers with the format `Digest: SHA-256=<Base64EncodedHash>`.

Here is an example of how to create a digest for an HTTP response with `Content-Type: application/json` and body
`{"hello":"world"}`.

```javascript
import crypto from 'crypto';

const responseBody = JSON.stringify({ hello: 'world' });

const hash = crypto.createHash('sha256');
hash.update(responseBody);
const digest = hash.digest('base64');

const response = {
  status: 200,
  headers: {
    'Content-Type': 'application/json',
    'Digest': `SHA-256=${digest}`,
  },
  body: responseBody,
};
```

After adding the Digest header to the HTTP response, include the digest component when signing the response. The default
response components are ['@status', 'content-type', 'digest'].

```javascript
const components = ['@status', 'content-type', 'digest'];

(async () => {
  const signedResponse = await sign(response, { signer, components });
  // ... Send the signed response to the client
})();
```

This chapter demonstrates how to create a digest for an HTTP response and sign the response using the specified components.
