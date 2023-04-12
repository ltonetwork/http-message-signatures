---
layout: default
title: Verifying in the Browser
parent: Verification
nav_order: 2
---

# Verifying in the Browser

This guide demonstrates how to verify HTTP message signatures in the browser using the
[SubtleCrypto API](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto).

## Verify Callback

To verify signatures in the browser, you can use a callback function with the `verify()` method. The following example
shows how to create a `verifyHmac` function that verifies an HMAC-SHA256 signature.

```javascript
import { decode as base64UrlDecode } from 'base64url';

async function verifyHmac(data, signature, parameters) {
  const account = await getAccount(parameters.keyid);

  const keyData = new TextEncoder().encode(account.secretKey);
  const algorithm = { name: 'HMAC', hash: 'SHA-256' };
  const key = await crypto.subtle.importKey('raw', keyData, algorithm, false, ['verify']);

  const encodedData = new TextEncoder().encode(data);
  const decodedSignature = base64UrlDecode(signature);

  const valid = await crypto.subtle.verify('HMAC', key, decodedSignature, encodedData);
  if (!valid) throw new Error('Invalid signature');

  return account;
}
```

Now you have a `verifyHmac` callback function that can be used with the `verify()` function to verify signed HTTP
messages.

## Verifying a Message

To verify a signed HTTP message in the browser, use the `verify()` function with the `verifyHmac` callback function.

```javascript
import { verify } from '@ltonetwork/http-message-signatures';

const request = {
  method: 'POST',
  url: 'https://example.com/api/data',
  headers: {
    'Content-Type': 'application/json',
    'Digest': 'SHA-256=sGb8nTkaRMkAaN1MwoyfztzCOkUo8rwSlzSFNt6aA74=',
    'Signature': 'sig1="base64signature"',
    'Signature-Input': 'sig1=("@method" "@path" "@authority" "content-type" "digest");created=1618884475;keyid="test-key";alg="hmac-sha256"'
  }
};

(async () => {
  try {
    const account = await verify(request, { verify: verifyHmac });
// ... The signature is valid
  } catch (error) {
// ... The signature is invalid
  }
})();
```

The `verify()` function will return a promise that resolves to the account associated with the key used to sign the
message if the signature is valid. If the signature is invalid or verification fails for any reason, the promise will be
rejected.

### Verifying the Digest

When the `Digest` or `Content-Digest` header is present in an HTTP message, it's crucial to verify it to ensure the
integrity of the message body. The following example shows how to verify the `Digest` header of an HTTP response using
the SHA-256 hashing algorithm.

```javascript
import { base64 } from '@ltonetwork/http-message-signatures';

(async () => {
  const receivedBody = '{"hello":"world"}';
  const receivedDigestHeader = 'SHA-256=sGb8nTkaRMkAaN1MwoyfztzCOkUo8rwSlzSFNt6aA74=';
  
  const [algorithm, receivedDigest] = digestHeader.split('=');
  if (algorithm !== 'SHA-256') throw new Error('Unsupported digest algorithm');

  const hashBuffer = await crypto.subtle.digest('SHA-256', receivedBody);
  const calculatedDigest = base64.encode(hashBuffer);

  if (receivedDigest !== calculatedDigest) throw new Error('Invalid digest');
})();
```
