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
    'Content-Type': 'application/json',
    'X-Api-Key': 'some-api-key',
    'Signature': 'keyid="test-key",algorithm="hmac-sha256",signature="base64encodedsignature"',
    'Signature-Input': 'sig1=("@method" "@path" "@authority" "content-type");created=1618884475'
  }
};

(async () => {
  try {
    const verified = await verify(request, verifyCallback);
    console.log('Verification succeeded');
  } catch (err) {
    console.error('Verification failed:', err.message);
  }
})();
```

For platform-specific examples on how to verify HTTP messages, refer to the following guides:

- [Verification in Node.js](verification/nodejs.md)
- [Verification in the Browser](verification/browser.md)
