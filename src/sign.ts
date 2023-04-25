import { Component, LTOAccount, Parameters, RequestLike, ResponseLike, Signer, SignOptions } from './types';
import { buildSignatureInputString, buildSignedData } from './build';
import { encode as base64Encode } from './base64';

const defaultRequestComponents: Component[] = ['@method', '@path', '@query', '@authority', 'content-type', 'digest'];
const defaultResponseComponents: Component[] = ['@status', 'content-type', 'digest'];

const keyTypeToAlg = {
  ed25519: 'ed25519',
  secp256k1: 'ecdsa-secp256k1',
  secp256r1: 'ecdsa-p256',
};

function signWithLTO<T extends LTOAccount>(account: T): Signer {
  return {
    sign: (data: string) => account.sign(data),
    keyid: account.publicKey,
    alg: keyTypeToAlg[account.keyType],
  };
}

export async function sign<T extends RequestLike | ResponseLike>(message: T, opts: SignOptions): Promise<T> {
  const { signer: _signer, components: _components, key: _key, ...params } = opts;

  const signer = 'keyType' in _signer ? signWithLTO(_signer) : _signer;
  const components = _components ?? ('status' in message ? defaultResponseComponents : defaultRequestComponents);
  const key = _key || 'sig1';

  const signParams: Parameters = {
    created: new Date(),
    keyid: signer.keyid,
    alg: signer.alg,
    ...(params as Parameters),
  };

  const signatureInputString = buildSignatureInputString(components, signParams);
  const dataToSign = buildSignedData(message, components, signatureInputString);

  const signature = await signer.sign(dataToSign);
  const sigBase64 = base64Encode(signature);

  if (typeof message.headers.set === 'function') {
    message.headers.set('Signature', `${key}=:${sigBase64}:`);
    message.headers.set('Signature-Input', `${key}=${signatureInputString}`);
  } else {
    Object.assign(message.headers, {
      Signature: `${key}=:${sigBase64}:`,
      'Signature-Input': `${key}=${signatureInputString}`,
    });
  }

  return message;
}
