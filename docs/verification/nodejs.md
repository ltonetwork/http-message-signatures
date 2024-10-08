---
layout: default
title: Verifying in Node.js
parent: Verification
nav_order: 1
---

# Verifying in Node.js

This guide demonstrates verifying HTTP message signatures in Node.js using the native `crypto` library.

## Verifier

In Node.js, you can create a verifier callback function using the native `crypto` library. The following example shows
how to create a `verifyHmac` callback function that can be used with the `verify()` function to verify HTTP message
signatures.

```javascript
import crypto from 'crypto';
import getAccount from './accounts';

export async function verifyHmac(data, signature, params) {
  const account = await getAccount(params.keyid);

  const hmac = crypto.createHmac('sha256', account.secretKey);
  hmac.update(data);

  if (signature !== hmac.digest()) {
    throw new Error("Invalid signature");
  }

  return account
}
```

Now you have a `verifyHmac` callback that can be used with the `verify()` function to verify HTTP message signatures.

_Consider using `crypto.timingSafeEqual()` to compare signatures, if you're worried about timing attacks._

## Verifying a message

To verify a request or response in Node.js, use the `verify()` function with the `verifyHmac` callback.

```javascript
import { verify } from '@ltonetwork/http-message-signatures';
import { verifyMac } from './verify-mac';

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
    const account = await verify(request, verifyHmac);
    // ... Process the verified request
  } catch (err)
    // ... Handle the failed verification
  }
})();
```

### Express

If you're using [Express](https://expressjs.com/) or [NestJS](https://nestjs.com/), you can pass the Express request
object to the `verify()` method.

This example shows how to create a NestJS middleware class verifying an Express request.

```typescript
import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { verify } from '@ltonetwork/http-message-signatures';
import { verifyMac } from './verify-mac';

@Injectable()
export class VerifySignatureMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    try {
      request['signer'] = await verify(request, verifyHmac);
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.FORBIDDEN);
    }

    next();
  }
}
```

### Verifying the Digest

When the `Digest` or `Content-Digest` header is present in an HTTP message, it's crucial to verify it to ensure the
integrity of the message body. The following example shows how to verify the `Digest` header in Node.js using the
`crypto` library.

1. Calculate the hash of the received message body using the same hashing algorithm as in the `Digest` header.
2. Encode the hash in Base64 format.
3. Compare the calculated hash with the hash in the `Digest` header.

```javascript
import crypto from 'crypto';

const receivedBody = '{"hello":"world"}';
const receivedDigestHeader = 'SHA-256=sGb8nTkaRMkAaN1MwoyfztzCOkUo8rwSlzSFNt6aA74=';

const [algorithm, receivedDigest] = digestHeader.split('=');
if (algorithm !== 'SHA-256') throw new Error('Unsupported digest algorithm');

const hash = crypto.createHash('sha256');
hash.update(receivedBody);
const calculatedDigest = hash.digest('base64');

if (receivedDigest !== calculatedDigest) throw new Error('Invalid digest');
```

This chapter demonstrates how to verify the `Digest` header in Node.js. If the `isValidDigest` variable is `true`, the
message body integrity is confirmed. Otherwise, the message body may have been tampered with during transit.
