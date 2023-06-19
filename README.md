![LTO github readme](https://user-images.githubusercontent.com/100821/231175702-a7b8a49e-1264-409f-b408-6014a35d27e1.png)

# HTTP Message Signatures

This library provides a simple way to implement the
[IETF HTTP Message Signatures draft standard](https://www.ietf.org/archive/id/draft-ietf-httpbis-message-signatures-00.html)
for signing and verifying the integrity and authenticity of HTTP requests and responses.

HTTP Message Signatures provide a secure way to ensure that HTTP messages exchanged between clients and servers are
authentic and have not been tampered with during transit.

The library does not provide any cryptographic functionality, but instead relies on the user to provide `Signer` and
`Verify` callback functions for signing and verifying messages, respectively. This allows you to choose your preferred
cryptographic library and signing algorithm.

This library can be used both in Node.js and the browser, and the documentation provides platform-specific examples for
each environment.

## Usage

### Signing

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
    'Digest': 'sha-256=4VYMyeX0tNLQ7opuAJeMECP3HgfLswAG3n+IqQprO0Q=',
  }
};


(async () => {
    const signedRequest = await sign(request, { signer });
    // ... Send the signed request to the server
})();
```

### Verification

```javascript
import { verify } from '@ltonetwork/http-message-signatures';

const verifyCallback = async (data, signature, params) => {
  const account = await getAccount(params.keyid);

  // ... Verify the signature using your preferred cryptographic library
  if (!valid) throw new Error('Invalid signature');
  
  return account;
};


const request = {
  method: 'POST',
  url: 'https://example.com/api/data',
  headers: {
    'Content-Type': 'application/json',
    'Digest': 'sha-256=4VYMyeX0tNLQ7opuAJeMECP3HgfLswAG3n+IqQprO0Q=',
    'Signature': 'keyid="test-key",algorithm="hmac-sha256",signature="base64encodedsignature"',
    'Signature-Input': 'sig1=("@method" "@path" "@authority" "content-type" "digest");created=1618884475'
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

## Documentation

For detailed information on how to use this library, please visit the
[HTTP Message Signatures documentation](https://ltonetwork.github.io/http-message-signatures).

## Table of Contents

1. [Installation](https://ltonetwork.github.io/http-message-signatures/installation)
2. [Signing](https://ltonetwork.github.io/http-message-signatures/signing/index)
    - [Signing in Node.js](https://ltonetwork.github.io/http-message-signatures/signing/nodejs)
    - [Signing in the Browser](https://ltonetwork.github.io/http-message-signatures/signing/browser)
    - [Signing with LTO](https://ltonetwork.github.io/http-message-signatures/signing/lto.html)
3. [Verification](https://ltonetwork.github.io/http-message-signatures/verification/index)
    - [Verifying in Node.js](https://ltonetwork.github.io/http-message-signatures/verification/nodejs)
    - [Verifying in the Browser](https://ltonetwork.github.io/http-message-signatures/verification/browser)
    - [Verifying with LTO](https://ltonetwork.github.io/http-message-signatures/verification/lto.html)
4. [Accept-Signature](https://ltonetwork.github.io/http-message-signatures/accept-signature)
5. [API Reference](https://ltonetwork.github.io/http-message-signatures/api-reference)

## Contributing

We welcome contributions to this project. If you have a feature request, bug report, or would like to contribute code,
please open an issue or submit a pull request on the
[HTTP Message Signatures GitHub repository](https://github.com/ltonetwork/http-message-signatures).
