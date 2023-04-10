---
layout: default
title: Installation
nav_order: 1
---

# Installation

This guide will help you install the @ltonetwork/http-message-signatures library in your project. It works both in Node.js and in the browser.

## Node.js

To install the library in a Node.js project, you can use npm or yarn.

### Using npm

Run the following command in your project directory:

```
npm install @ltonetwork/http-message-signatures
```

### Using yarn

Run the following command in your project directory:

```
yarn add @ltonetwork/http-message-signatures
```

## Browser

To use the library in the browser, you can either use a bundler like webpack or add the library as a script tag.

### Using a bundler

Install the library as described in the Node.js section. Then, import the library in your JavaScript code:

```
import * as HttpMessageSignatures from '@ltonetwork/http-message-signatures';
```

### Adding as a script tag

Download the pre-built UMD version of the library and include it in your HTML file using a script tag:

```html
<script src="path/to/http-message-signatures.min.js"></script>
```

This will expose the library as a global variable named `HttpMessageSignatures`.

## Next Steps

After installing the library, you can learn how to sign and verify HTTP messages by following the [Signing Guide](./signing.md) and the [Verifying Guide](./verifying.md).
