import { Component, HeaderValue, Parameter, Parameters } from './types';
import { decode as base64Decode } from './base64';

function parseEntry(headerName: string, entry: string): [string, string | number | true | Array<string | number>] {
  const [key, value] = entry.split('=');

  if (value === undefined) return [key.trim(), true];

  if (value.match(/^".*"$/)) return [key.trim(), value.slice(1, -1)];
  if (value.match(/^\d+$/)) return [key.trim(), parseInt(value)];

  if (value.match(/^\(.*\)$/)) {
    const arr = value
      .slice(1, -1)
      .split(/\s+/)
      .map((entry) => entry.match(/^"(.*)"$/)?.[1] ?? parseInt(entry));

    if (arr.some((value) => typeof value === 'number' && isNaN(value))) {
      throw new Error(`Invalid ${headerName} header. Invalid value ${key}=${value}`);
    }

    return [key.trim(), arr];
  }

  throw new Error(`Invalid ${headerName} header. Invalid value ${key}=${value}`);
}

function parseParametersHeader(
  name: string,
  header: HeaderValue,
): { key: string; components: Component[]; parameters: Parameters } {
  const entries = header
    .toString()
    .match(/(?:[^;"]+|"[^"]+")+/g)
    .map((entry) => parseEntry(name, entry.trim()));

  const componentsIndex = entries.findIndex(([, value]) => Array.isArray(value));
  if (componentsIndex === -1) throw new Error(`Invalid ${name} header. Missing components`);
  const [[key, components]] = entries.splice(componentsIndex, 1) as [[string, Component[]]];

  if (entries.some(([, value]) => Array.isArray(value))) {
    throw new Error(`Multiple signatures is not supported`);
  }

  const parameters = Object.fromEntries(entries) as { [name: Parameter]: string | number | Date | undefined };
  if (typeof parameters.created === 'number') parameters.created = new Date(parameters.created * 1000);
  if (typeof parameters.expires === 'number') parameters.expires = new Date(parameters.expires * 1000);

  return { key, components, parameters };
}

export function parseSignatureInputHeader(header: HeaderValue): {
  key: string;
  components: Component[];
  parameters: Parameters;
} {
  return parseParametersHeader('Signature-Input', header);
}

export function parseAcceptSignatureHeader(header: HeaderValue): {
  key: string;
  components: Component[];
  parameters: Parameters;
} {
  return parseParametersHeader('Accept-Signature', header);
}

export function parseSignatureHeader(key, header: HeaderValue): Uint8Array {
  const signatureMatch = header.toString().match(/^([\w-]+)=:([A-Za-z0-9+/=]+):$/);
  if (!signatureMatch) throw new Error('Invalid Signature header');

  const [, signatureKey, signature] = signatureMatch;
  if (signatureKey !== key) throw new Error(`Invalid Signature header. Key mismatch ${signatureKey} !== ${key}`);

  return base64Decode(signature);
}
