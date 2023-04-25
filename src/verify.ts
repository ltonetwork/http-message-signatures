import { LTO, LTOAccount, Parameters, RequestLike, ResponseLike, Verify } from './types';
import { parseSignatureHeader, parseSignatureInputHeader } from './parse';
import { buildSignedData, extractHeader } from './build';

const algToKeyType = {
  ed25519: 'ed25519',
  'ecdsa-secp256k1': 'secp256k1',
  'ecdsa-p256': 'secp256r1',
};

export function verifyWithLTO<T>(lto: LTO<T>, signedData: string, signature: Uint8Array, parameters: Parameters): T {
  const keyType = algToKeyType[parameters.alg];
  if (!keyType) throw new Error(`Unsupported algorithm for LTO: ${parameters.alg}`);

  const account = lto.account({ keyType, publicKey: parameters.keyid }) as LTOAccount;
  if (!account.verify(signedData, signature)) throw new Error('Invalid signature');

  return account as T;
}

export async function verify<T>(message: RequestLike | ResponseLike, verifier: Verify<T> | LTO<T>): Promise<T> {
  const signatureInputHeader = extractHeader(message, 'signature-input');
  if (!signatureInputHeader) throw new Error('Message does not contain Signature-Input header');
  const { key, components, parameters } = parseSignatureInputHeader(signatureInputHeader);

  if (parameters.expires && parameters.expires < new Date()) throw new Error('Signature expired');

  const signatureHeader = extractHeader(message, 'signature');
  if (!signatureHeader) throw new Error('Message does not contain Signature header');
  const signature = parseSignatureHeader(key, signatureHeader);

  const signatureInputString = signatureInputHeader.toString().replace(/^[^=]+=/, '');
  const signedData = buildSignedData(message, components, signatureInputString);

  return typeof verifier === 'function'
    ? verifier(signedData, signature, parameters)
    : verifyWithLTO(verifier, signedData, signature, parameters);
}
