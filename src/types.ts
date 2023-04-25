export interface Signer {
  sign: (data: string) => Uint8Array | Promise<Uint8Array>;
  keyid: string;
  alg: string;
}

export type Verify<T> = (data: string, signature: Uint8Array, params: Parameters) => T | Promise<T>;

export interface LTOAccount {
  sign: (data: string) => Uint8Array;
  verify: (message: string | Uint8Array, signature: Uint8Array) => boolean;
  keyType: 'ed25519' | 'secp256k1' | 'secp256r1' | string;
  publicKey: string;
}

export interface LTO<T> {
  account: (settings: Record<string, any>) => T;
}

interface HeadersMap {
  get(name: string): string | null;
  set(name: string, value: string): void;
}

type Headers = Record<string, string> | HeadersMap;

export type HeaderValue = { toString(): string } | string | string[] | undefined;

export type RequestLike = {
  method: string;
  url: string;
  headers: Headers;
};

export type ResponseLike = {
  status: number;
  headers: Headers;
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

type StandardParameters = {
  expires?: Date;
  created?: Date;
  nonce?: string;
  alg?: string;
  keyid?: string;
  tag?: string;
};

export type Parameters = StandardParameters & {
  [name: Parameter]: string | number | true | Date | { [Symbol.toStringTag]: () => string };
};

export type SignOptions = StandardParameters & {
  components?: Component[];
  key?: string;
  signer: Signer | LTOAccount;
  [name: Parameter]:
    | Component[]
    | Signer
    | LTOAccount
    | string
    | number
    | true
    | Date
    | { [Symbol.toStringTag]: () => string };
};
