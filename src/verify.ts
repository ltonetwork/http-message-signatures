import { RequestLike, ResponseLike, Verify } from './types';
import { parseSignatureHeader, parseSignatureInputHeader } from './parse';
import { buildSignedData } from './build';

export async function verify<T>(message: RequestLike | ResponseLike, verifySignature: Verify<T>): Promise<T> {
  const signatureInputHeader = message.headers['signature-input'];
  if (!signatureInputHeader) throw new Error('Message does not contain Signature-Input header');
  const { key, components, parameters } = parseSignatureInputHeader(signatureInputHeader);

  const signatureHeader = message.headers['signature'];
  if (!signatureHeader) throw new Error('Message does not contain Signature header');
  const signature = parseSignatureHeader(key, signatureHeader);

  const signedData = buildSignedData(message, components, signatureInputHeader.toString());

  return verifySignature(signedData, signature, parameters);
}
