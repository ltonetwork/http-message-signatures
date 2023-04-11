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
    sign: (data: string) => Promise.resolve(account.sign(data)),
    keyid: account.publicKey,
    alg: keyTypeToAlg[account.keyType],
  };
}

export async function sign<T extends RequestLike | ResponseLike>(message: T, opts: SignOptions): Promise<T> {
  const signer = 'keyType' in opts.signer ? signWithLTO(opts.signer) : opts.signer;

  const signingComponents: Component[] =
    opts.components ?? ('status' in message ? defaultResponseComponents : defaultRequestComponents);
  const signingParams: Parameters = {
    ...opts.parameters,
    created: opts.created || new Date(),
    keyid: signer.keyid,
    alg: signer.alg,
  };
  const signatureInputString = buildSignatureInputString(signingComponents, signingParams);
  const dataToSign = buildSignedData(message, signingComponents, signatureInputString);

  const key = opts.key || 'sig1';
  const signature = await signer.sign(dataToSign);
  const sigBase64 = base64Encode(signature);

  Object.assign(message.headers, {
    Signature: `${key}=:${sigBase64}:`,
    'Signature-Input': `${key}=${signatureInputString}`,
  });

  return message;
}
