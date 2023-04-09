export interface Signer {
  sign: (data: string) => Promise<Uint8Array>;
  keyId: string;
  alg: string;
}

export interface LTOAccount {
  sign: (data: string) => Uint8Array;
  keyType: 'ed25519' | 'secp256k1' | 'secp256r1';
  publicKey: string;
}

export type Verify<T> = (data: string, signature: Uint8Array, params: VerifyParams) => Promise<T>;

export type RequestLike = {
  method: string;
  url: string;
  headers: Record<string, { toString(): string } | string | string[] | undefined>;
};

export type ResponseLike = {
  status: number;
  headers: Record<string, { toString(): string } | string | string[] | undefined>;
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
  | string;

export type ResponseComponent = '@status' | '@request-response' | Component;

export type Parameters = {
  [name: Parameter]: string | number | Date | { [Symbol.toStringTag]: () => string };
};

export type SignOptions = {
  components?: Component[];
  parameters?: Parameters;
  allowMissingHeaders?: boolean;
  signer: Signer;
  created?: Date;
};

export type HeaderExtractionOptions = {
  allowMissing: boolean;
};

export type VerifyParams = {
  alg: string;
  keyId: string;
  created: Date;
};
