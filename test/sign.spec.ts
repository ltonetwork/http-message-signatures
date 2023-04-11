import { expect } from 'chai';
import { sign, Signer, RequestLike, ResponseLike } from '../src';
import { encode as base64Encode } from '../src/base64';
import LTO, { Account } from '@ltonetwork/lto';

const sampleRequest: RequestLike = {
  method: 'POST',
  url: 'https://example.com/path?query=string',
  headers: {
    'Content-Type': 'application/json',
    Digest: 'SHA-256=abcdef',
  },
};
const sampleResponse: ResponseLike = {
  status: 200,
  headers: {
    'Content-Type': 'text/plain',
    Digest: 'SHA-256=abcdef',
    'X-Total': '200',
  },
};
const created = new Date(1681004344000);

describe('sign', () => {
  const expectedHash = new Uint8Array([
    227, 176, 196, 66, 152, 252, 28, 20, 154, 251, 244, 200, 153, 111, 185, 36, 39, 174, 65, 228, 100, 155, 147, 76,
    164, 149, 153, 27, 120, 82, 184, 85,
  ]);
  const expectedHashBase64 = base64Encode(expectedHash);

  describe('request', () => {
    it('should apply default components', async () => {
      const expectedData = [
        '"@method": POST',
        '"@path": /path',
        '"@query": ?query=string',
        '"@authority": example.com',
        '"content-type": application/json',
        '"digest": SHA-256=abcdef',
        '"@signature-params": ("@method" "@path" "@query" "@authority" "content-type" "digest");created=1681004344;keyid="test-key";alg="hmac-sha256"',
      ].join('\n');

      const signer: Signer = {
        keyid: 'test-key',
        alg: 'hmac-sha256',
        async sign(data) {
          expect(data).to.equal(expectedData);
          return expectedHash;
        },
      };

      const signedRequest = await sign(sampleRequest, { signer, created });
      expect(signedRequest.headers).to.deep.equal({
        'Content-Type': 'application/json',
        Digest: 'SHA-256=abcdef',
        Signature: `sig1=:${expectedHashBase64}:`,
        'Signature-Input':
          'sig1=("@method" "@path" "@query" "@authority" "content-type" "digest");created=1681004344;keyid="test-key";alg="hmac-sha256"',
      });
    });

    it('should apply custom components', async () => {
      const components = ['@authority', '@method', '@path', 'digest'];
      const expectedData = [
        '"@authority": example.com',
        '"@method": POST',
        '"@path": /path',
        '"digest": SHA-256=abcdef',
        '"@signature-params": ("@authority" "@method" "@path" "digest");created=1681004344;keyid="test-key";alg="hmac-sha256"',
      ].join('\n');

      const signer: Signer = {
        keyid: 'test-key',
        alg: 'hmac-sha256',
        async sign(data) {
          expect(data).to.equal(expectedData);
          return expectedHash;
        },
      };

      const signedRequest = await sign(sampleRequest, { signer, components, created });
      expect(signedRequest.headers).to.deep.equal({
        'Content-Type': 'application/json',
        Digest: 'SHA-256=abcdef',
        Signature: `sig1=:${expectedHashBase64}:`,
        'Signature-Input':
          'sig1=("@authority" "@method" "@path" "digest");created=1681004344;keyid="test-key";alg="hmac-sha256"',
      });
    });

    it('should apply the key name', async () => {
      const components = ['@authority'];
      const expectedData = [
        '"@authority": example.com',
        '"@signature-params": ("@authority");created=1681004344;keyid="test-key";alg="hmac-sha256"',
      ].join('\n');

      const signer: Signer = {
        keyid: 'test-key',
        alg: 'hmac-sha256',
        async sign(data) {
          expect(data).to.equal(expectedData);
          return expectedHash;
        },
      };

      const signedRequest = await sign(sampleRequest, { components, signer, created, key: 'foo' });
      expect(signedRequest.headers).to.deep.equal({
        'Content-Type': 'application/json',
        Digest: 'SHA-256=abcdef',
        Signature: `foo=:${expectedHashBase64}:`,
        'Signature-Input': 'foo=("@authority");created=1681004344;keyid="test-key";alg="hmac-sha256"',
      });
    });
  });

  describe('response', () => {
    it('should apply default components', async () => {
      const expectedData = [
        '"@status": 200',
        '"content-type": text/plain',
        '"digest": SHA-256=abcdef',
        '"@signature-params": ("@status" "content-type" "digest");created=1681004344;keyid="test-key";alg="hmac-sha256"',
      ].join('\n');

      const signer: Signer = {
        keyid: 'test-key',
        alg: 'hmac-sha256',
        async sign(data) {
          expect(data).to.equal(expectedData);
          return expectedHash;
        },
      };

      const signedResponse = await sign(sampleResponse, { signer, created });
      expect(signedResponse.headers).to.deep.equal({
        'Content-Type': 'text/plain',
        'X-Total': '200',
        Digest: 'SHA-256=abcdef',
        Signature: `sig1=:${expectedHashBase64}:`,
        'Signature-Input':
          'sig1=("@status" "content-type" "digest");created=1681004344;keyid="test-key";alg="hmac-sha256"',
      });
    });

    it('should apply custom components', async () => {
      const components = ['@status', 'digest', 'x-total'];
      const expectedData = [
        '"@status": 200',
        '"digest": SHA-256=abcdef',
        '"x-total": 200',
        '"@signature-params": ("@status" "digest" "x-total");created=1681004344;keyid="test-key";alg="hmac-sha256"',
      ].join('\n');

      const signer: Signer = {
        keyid: 'test-key',
        alg: 'hmac-sha256',
        async sign(data) {
          expect(data).to.equal(expectedData);
          return expectedHash;
        },
      };

      const signedRequest = await sign(sampleResponse, { signer, components, created });
      expect(signedRequest.headers).to.deep.equal({
        'Content-Type': 'text/plain',
        'X-Total': '200',
        Digest: 'SHA-256=abcdef',
        Signature: `sig1=:${expectedHashBase64}:`,
        'Signature-Input': 'sig1=("@status" "digest" "x-total");created=1681004344;keyid="test-key";alg="hmac-sha256"',
      });
    });
  });

  describe('with lto', async () => {
    const algorithms: [string, 'ed25519' | 'secp256k1' | 'secp256r1'][] = [
      ['ed25519', 'ed25519'],
      //['ecdsa-secp256k1', 'secp256k1'],
      //['ecdsa-p256', 'secp256r1'],
    ];

    const lto = new LTO('T');

    algorithms.forEach(([alg, keyType]) => {
      let account: Account;
      let signatureParams: string;
      let expectedData: string;

      before(() => {
        account = lto.account({ keyType, seed: 'test' });
      });

      before(() => {
        signatureParams = `("@method" "@path" "@query" "@authority" "content-type" "digest");created=1681004344;keyid="${account.publicKey}";alg="${alg}"`;
        expectedData = [
          '"@method": POST',
          '"@path": /path',
          '"@query": ?query=string',
          '"@authority": example.com',
          '"content-type": application/json',
          '"digest": SHA-256=abcdef',
          `"@signature-params": ${signatureParams}`,
        ].join('\n');
      });

      it(`should return a ${keyType} account`, async () => {
        const expectedSignature = account.sign(expectedData).base64;

        const signedRequest = await sign(sampleRequest, { signer: account, created });
        expect(signedRequest.headers).to.deep.equal({
          'Content-Type': 'application/json',
          Digest: 'SHA-256=abcdef',
          Signature: `sig1=:${expectedSignature}:`,
          'Signature-Input': `sig1=${signatureParams}`,
        });
      });
    });
  });
});
