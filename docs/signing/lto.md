---
layout: default
title: Signing with LTO
parent: Signing
nav_order: 3
---

# Signing with LTO

To sign with the LTO client, you do not need to create a `Signer` object, as the `sign()` method accepts an LTO account
as the `signer`.

```javascript
import LTO from '@ltonetwork/lto';
import { sign } from '@ltonetwork/http-message-signatures';

const lto = new LTO();
const account = lto.account({ seed: 'you account seed', keyType: 'ed25519' });

const request = {
  method: 'GET',
  url: 'https://example.com/api/data',
};

(async () => {
  const signedRequest = await sign(request, { signer: account });
// ... Send the signed request to the server
})();
```

When using an LTO account to sign, the `keyid` will be the public key of the account.
