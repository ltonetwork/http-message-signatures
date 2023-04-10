---
layout: default
title: Signing in the Browser
parent: Signing
nav_order: 2
---

# Signing in the Browser

This guide demonstrates how to sign HTTP messages in the browser using the SubtleCrypto API.

## Signer

In the browser, you can create a `Signer` object using the SubtleCrypto API. The following example shows how to create
a `SignerHmac` class that implements the required properties and methods for a `Signer`.

```javascript
import { encode as base64UrlEncode } from 'base64url';

class SignerHmac {
  alg = 'hmac-sha256';

  constructor(key, keyid = 'test-key') {
    this.key = key;
    this.keyid = keyid;
  }
  
  async getKey() {
    const keyData = new TextEncoder().encode(this.key);
    const algorithm = { name: 'HMAC', hash: 'SHA-256' };
    return await crypto.subtle.importKey('raw', keyData, algorithm, false, ['sign']);
  }

  async sign(data) {
    const encoded = new TextEncoder().encode(data);
    const key = await this.getKey();
    const signature = await window.crypto.subtle.sign('HMAC', key, encoded);
    return new Uint8Array(signature);
  }
}

const signer = new SignerHmac('your-secret-key', 'test-key');
```

Now you have a `signer` object that can be used with the `sign()` function to sign HTTP messages.

## Signing a message

To sign a request or response in the browser, use the `sign()` function with the `SignerHmac` created above.

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
using the SHA-256 hashing algorithm and the SubtleCrypto API:

1. Calculate the SHA-256 hash of the response body.
2. Encode the hash in Base64 format.
3. Add the Digest header to the response headers with the format `Digest: SHA-256=<Base64EncodedHash>`.

Here is an example of how to create a digest for an HTTP response with `Content-Type: application/json` and body
`{"hello":"world"}`.

```javascript
const responseBody = JSON.stringify({ hello: 'world' });
const encodedBody = new TextEncoder().encode(responseBody);

const digestBuffer = await crypto.subtle.digest('SHA-256', encodedBody);
const digestArray = Array.from(new Uint8Array(digestBuffer));
const digestBase64 = btoa(digestArray.map(b => String.fromCharCode(b)).join(''));

const response = {
  status: 200,
  headers: {
    'Content-Type': 'application/json',
    'Digest': `SHA-256=${digestBase64}`,
  },
  body: responseBody,
};
```

After adding the Digest header to the HTTP response, include the digest component when signing the response. The default
response components are `['@status', 'content-type', 'digest']`.

```javascript
const components = ['@status', 'content-type', 'digest'];

(async () => {
  const signedResponse = await sign(response, { signer, components });
  // ... Send the signed response to the client
})();
```
