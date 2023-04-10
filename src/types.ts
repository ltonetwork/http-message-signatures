export interface Signer {
  sign: (data: string) => Promise<Uint8Array>;
  keyid: string;
  alg: string;
}

export interface LTOAccount {
  sign: (data: string) => Uint8Array;
  keyType: 'ed25519' | 'secp256k1' | 'secp256r1';
  publicKey: string;
}

export type Verify<T> = (data: string, signature: Uint8Array, params: Parameters) => Promise<T>;

export type HeaderValue = { toString(): string } | string | string[] | undefined;

export type RequestLike = {
  method: string;
  url: string;
  headers: Record<string, HeaderValue>;
};

export type ResponseLike = {
  status: number;
  headers: Record<string, HeaderValue>;
};

// see https://datatracker.ietf.org/doc/html/draft-ietf-httpbis-message-signatures-06#section-2.3.1
export type Parameter = 'created' | 'expires' | 'nonce' | 'alg' | 'keyid' | string;

export type Component =
  | '@method'
  | '@target-uri'
  | '@authority'
  | '@scheme'
  | '@request-target'
  | '@path'
  | '@query'
  | '@query-params'
  | '@status'
  | '@request-response'
  | string;

export type Parameters = {
  expires?: Date;
  created?: Date;
  nonce?: string | number;
  alg?: string;
  keyid?: string;
  [name: Parameter]: string | number | true | Date | { [Symbol.toStringTag]: () => string };
};

export type SignOptions = {
  components?: Component[];
  parameters?: Parameters;
  allowMissingHeaders?: boolean;
  key?: string;
  signer: Signer;
  created?: Date;
};

export type HeaderExtractionOptions = {
  allowMissing: boolean;
};
