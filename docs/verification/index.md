---
layout: default
title: Verification
nav_order: 3
has_children: true
---

# Verification

The `verify()` function checks the `Signature` and `Signature-Input` headers of an HTTP request or response to ensure the
integrity and authenticity of the data sent between clients and servers.

The `Signature` header contains the signature of the HTTP message, and the `Signature-Input` header contains the
components that were used to generate the signature.

## Verify Callback

This library does not provide any cryptographic functionality. Instead, it relies on a callback function to verify
the HTTP message signature. The callback function must:

1. Take the signed data as a `string`
2. Take the signature as an `Uint8Array`
3. Take the additional parameters as an object
4. Returns an item if the signature is valid, or throws an error if the signature is invalid.

The item that's returned by the verify callback function will be returned by the `verify()` function.

### Example

```javascript
import { verify } from '@ltonetwork/http-message-signatures';

const verifyCallback = async (data, signature, params) => {
  const account = await getAccount(params.keyid);
  
  // ... Verify the signature using your preferred cryptographic library
  if (!valid) throw new Error('Invalid signature');
  
  return account;
};

const request = {
  method: 'GET',
  url: 'https://example.com/api/data',
  headers: {
    'Signature-Input': 'sig1=("@method" "@path" "@authority");created=1618884475;keyid="test-key";alg="hmac-sha256"',
    'Signature': 'sig1=:base64signature:'
  }
};

(async () => {
  try {
    const account = await verify(request, verifyCallback);
    console.log('Verification succeeded');
  } catch (err) {
    console.error('Verification failed:', err.message);
  }
})();
```

For platform-specific examples on how to verify HTTP messages, refer to the following guides:

- [Verification in Node.js](verification/nodejs.md)
- [Verification in the Browser](verification/browser.md)

## Verifying with LTO

To verify with the LTO client, you do not need to create a verify callback, as the `verify()` method accepts an LTO
client as verifier. The key type is determined based on the algorithm specified in the `Signature`. The keyid is used as
the public key. The `verify()` method uses the LTO Client to create an account from the public key and verify the
signature.

```javascript
import LTO from '@ltonetwork/lto';
import { sign } from '@ltonetwork/http-message-signatures';

const lto = new LTO();

const request = {
  method: 'GET',
  url: 'https://example.com/api/data',
  headers: {
    'Signature-Input': 'sig1=("@method" "@path" "@authority");created=1618884475;keyid="2KduZAmAKuXEL463udjCQkVfwJkBQhpciUC4gNiayjSJ";alg=ed25519',
    'Signature': 'sig1=:base64signature:'
  }
};

(async () => {
  try {
    const account = await verify(request, lto);
    console.log('Verification succeeded');
  } catch (err) {
    console.error('Verification failed:', err.message);
  }
})();

```

## Verifying the Digest

When the `Digest` or `Content-Digest` header is present in an HTTP message, it's crucial to verify it to ensure the
integrity of the message body. The `Signature` header only message headers as components. The `Digest` header allows you
to compare the received hash with the hash you calculate from the message body. If the hashes match, you can be
confident that the message body has not been tampered with during transit.

Verifying the `Digest` header is outside the scope of this library, but examples on how to do this can be found in the
[Node.js](verification/nodejs.md) and [Browser](verification/browser.md) guides.
