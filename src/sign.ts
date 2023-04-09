import { Component, Parameters, RequestLike, ResponseLike, SignOptions } from './types';
import { buildSignatureInputString, buildSignedData } from './build';
import { encode as base64Encode } from './base64';

const defaultRequestComponents: Component[] = ['@method', '@path', '@query', '@authority', 'content-type', 'digest'];
const defaultResponseComponents: Component[] = ['@status', 'content-type', 'digest'];

export async function sign<T extends RequestLike | ResponseLike>(message: T, opts: SignOptions): Promise<T> {
  const signingComponents: Component[] =
    opts.components ?? ('status' in message ? defaultResponseComponents : defaultRequestComponents);
  const signingParams: Parameters = {
    ...opts.parameters,
    created: opts.created || new Date(),
    keyId: opts.signer.keyId,
    alg: opts.signer.alg,
  };
  const signatureInputString = buildSignatureInputString(signingComponents, signingParams);
  const dataToSign = buildSignedData(message, signingComponents, signatureInputString);

  const signature = await opts.signer.sign(dataToSign);
  const sigBase64 = base64Encode(signature);

  Object.assign(message.headers, {
    Signature: `sig1=:${sigBase64}:`,
    'Signature-Input': `sig1=${signatureInputString}`,
  });

  return message;
}
