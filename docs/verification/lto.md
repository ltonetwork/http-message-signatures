---
layout: default
title: Verifying with LTO
parent: Verification
nav_order: 2
---

# Verifying with LTO

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
