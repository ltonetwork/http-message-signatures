import { RequestLike, ResponseLike, Verify, VerifyParams } from './types';
import { decode as base64Decode } from './base64';
import { buildSignedData } from './build';

async function parseSignatureInputHeader(message: RequestLike | ResponseLike): Promise<string> {
  const signatureInputHeader = message.headers['signature-input'];
  if (!signatureInputHeader) {
    throw new Error('Message does not contain Signature-Input header');
  }
  const signatureInputMatch = signatureInputHeader.toString().match(/^sig1=(.*)$/);
  if (!signatureInputMatch) {
    throw new Error('Invalid Signature-Input header');
  }
  return signatureInputMatch[1];
}

function parseSignatureHeader(message: RequestLike | ResponseLike): Uint8Array {
  const signatureHeader = message.headers['signature'];
  if (!signatureHeader) {
    throw new Error('Message does not contain Signature header');
  }
  const signatureMatch = signatureHeader.toString().match(/^sig1=:([A-Za-z0-9+/=]+):$/);
  if (!signatureMatch) {
    throw new Error('Invalid Signature header');
  }
  const signatureBase64 = signatureMatch[1];
  return base64Decode(signatureBase64);
}

function extractComponents(signatureInputString: string): string[] {
  const componentsMatch = signatureInputString.match(/(^|,)\s*headers\s*=\s*"(.*)"\s*(,|$)/);
  if (!componentsMatch) {
    throw new Error('Signature-Input header does not contain headers parameter');
  }
  return componentsMatch[2].split(' ');
}

function parseSignatureParamsHeader(message: RequestLike | ResponseLike): VerifyParams {
  const signatureParamsHeader = message.headers['signature-params'];
  if (!signatureParamsHeader) {
    throw new Error('Message does not contain Signature-Params header');
  }

  const signatureParamsMatch = signatureParamsHeader.toString().match(/^sig1=([^,]*)/);
  if (!signatureParamsMatch) {
    throw new Error('Invalid Signature-Params header');
  }

  const signatureParamsString = signatureParamsMatch[1];
  const signatureParams = JSON.parse(`{${signatureParamsString}}`);

  return {
    alg: signatureParams.alg,
    keyId: signatureParams.keyId,
    created: new Date(signatureParams.created),
  };
}

export async function verify<T>(message: RequestLike | ResponseLike, verifySignature: Verify<T>): Promise<T> {
  const signatureInputString = await parseSignatureInputHeader(message);
  const components = extractComponents(signatureInputString);
  const signedData = buildSignedData(message, components, signatureInputString);

  const signature = parseSignatureHeader(message);
  const params = parseSignatureParamsHeader(message);

  return verifySignature(signedData, signature, params);
}
