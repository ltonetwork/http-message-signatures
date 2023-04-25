# API Reference

This API reference provides detailed documentation for the methods exposed through `index.ts`. It covers the following:

- Message types
- `sign`
- `verify`
- `parseAcceptSignature`
- `base64`

## Message types

### RequestLike

`RequestLike` is an interface with the following properties:

- `method`: string - The HTTP method of the request.
- `url`: string - The URL of the request.
- `headers`: Headers - The request headers.

Express request objects and the Request class of the Fetch API are examples of objects that implement the `RequestLike`
interface.

### ResponseLike

`ResponseLike` is an interface with the following properties:

- `status`: number - The HTTP status code of the response.
- `headers`: Headers - The response headers.

Express response objects and the Response class of the Fetch API are examples of objects that implement the
`ResponseLike` interface.

### Headers

`Headers` can be an object with header names as keys and header values as values. The header names are case-insensitive.

Alternatively, `Headers` can be a map of header names to header values. Getting a header by name should be
case-insensitive, or the header should be lowercase.

```typescript
interface HeadersMap {
  get(name: string): string | null;
  set(name: string, value: string): void;
}

type Headers = Record<string, string> | HeadersMap;
```


## sign

The `sign` function is used to sign a given message (either request or response) using the provided options.

```typescript
function sign<T extends RequestLike | ResponseLike>(message: T, opts: SignOptions): Promise<T>;
```

### Sign options

The following options can be given:

- `signer`: Signer | LTOAccount - The signer or LTOAccount used for signing the message.
- `components`: string[] (optional) - [Components](/signing#components) used for signing the message.
- `key`: string (optional) - The key used for signing the message. Defaults to "sig1".
- `created`: Date (optional) - The date used for signing the message. Defaults to the current date.
- `expires`: Date (optional) - The expiration date used for signing the message. Defaults to no expiration.
- `nonce`: string (optional) - A unique value to prevent replay attacks.
- `tag`: string (optional) - An application-specific identifier for the signature.
- `...params` (optional): Any other options will be treated as custom parameters and included in the signature input string.

### Signer interface

The `Signer` interface is used to sign a message using a private key.

* The `sign` method is used to sign the message. The private key is not passed, it must already be part of `sign()`.
* The `alg` property is used to identify the algorithm used for signing the message.
* The `keyid` property is used to identify the key during verification. The verifier must be able to retrieve the public
key corresponding to the keyid.

```typescript
interface Signer {
  sign(message: Uint8Array): Uint8Array | Promise<Uint8Array>;
  alg: string;
  keyid: string;
}
```

## verify

The `verify` function is used to verify the signature of a given message (either request or response) using the
provided verifier or LTO instance.

```typescript
function verify<T>(message: RequestLike | ResponseLike, verifier: Verify<T> | LTO<T>): Promise<T>;
```

## Verify callback

The verifier is a callback is used to verify the signature of a given message. It must throw an error if the signature
is invalid. Otherwise, it may return any value. That value will be returned by the `verify` function.

```typescript
export type Verify<T> = (data: string, signature: Uint8Array, params: Parameters) => T | Promise<T>;
```

## parseAcceptSignature

The `parseAcceptSignature` function is used to parse the 'Accept-Signature' header from an HTTP message.

```typescript
function parseAcceptSignature(header: HeaderValue): {
  key: string;
  components: Component[];
  parameters: Parameters;
};
```

## base64

The `base64` module provides utility functions for encoding and decoding base64 strings.

### encode

The `encode` function takes a Uint8Array and returns a base64 encoded string.

```typescript
function encode(data: Uint8Array): string;
```

### decode

The `decode` function takes a base64 encoded string and returns a Uint8Array.

```typescript
function decode(data: string): Uint8Array;
```
