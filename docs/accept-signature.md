---
layout: default
title: Accept-Signature
nav_order: 4
---

# Accept-Signature

When a client sends an HTTP request, it may include an `Accept-Signature` header to indicate the preferred components and
parameters to be used when signing the response. The `parseAcceptSignature` function can be used to extract the key,
components, and parameters from the `Accept-Signature` header. This information can then be used to sign the HTTP response
appropriately.

```
Accept-Signature: sig1=("@method" "@target-uri" "@authority" "content-type" "digest"); keyid="test-key";created;tag="app-123"
```

## Parsing the Accept-Signature Header

You can use the `parseAcceptSignature` function to extract the key, components, and parameters from the `Accept-Signature` header.
Here's an example:

```javascript
import { parseAcceptSignature } from 'http-message-signatures';

const acceptSignatureHeader = 'sig1=("@method" "@target-uri" "@authority" "content-type" "digest"); keyid="test-key";created;tag="app-123"';
const { key, components, parameters } = parseAcceptSignature(acceptSignatureHeader);
```

In this example, the `key`, `components`, and `parameters` extracted from the `Accept-Signature` header are:

* `key = "sig1"`
* `components = ["@method", "@target-uri", "@authority", "content-type", "digest"]`
* `parameters = { keyid: "test-key", created: true, tag: "app-123" }`

## Signing the HTTP Response

Once you have extracted the key, components, and parameters from the `Accept-Signature` header, you can use them to sign the HTTP response.

For example, you can sign the response using the extracted components and parameters:

```javascript
import { sign, parseAcceptSignature } from 'http-message-signatures';

const acceptSignatureHeader = 'sig1=("@method" "@target-uri" "@authority" "content-type" "digest"); keyid="test-key";created;tag="app-123"';
const { key, components, parameters } = parseAcceptSignature(acceptSignatureHeader);

const response = {
  status: 200,
  headers: {
    'Content-Type': 'application/json',
    'Digest': 'SHA-256=someBase64EncodedHash'
  },
  body: '{"hello":"world"}'
};

const signer = /* an instance of a Signer object */;

if (parameters.created === true) parameters.created = Math.floor(Date.now() / 1000);
if (parameters.expires === true) parameters.expires = Math.floor(Date.now() / 1000) + 3600;

const signedResponse = await sign(response, { signer, key, components, parameters });
```

This will sign the HTTP response using the components and parameters specified in the `Accept-Signature` header.
