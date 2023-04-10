import { expect } from 'chai';
import { parseAcceptSignatureHeader, parseSignatureInputHeader, parseSignatureHeader } from '../src/parse';

describe('parse.ts', () => {
  describe('parseParametersHeader', () => {
    it('should parse a valid Signature-Input header', () => {
      const header =
        'sig1=("@method" "@path" "@authority" "digest");created=1618884475;expires=1618888075;foo="ba;ra";zod';
      const result = parseSignatureInputHeader(header);

      expect(result).to.deep.equal({
        key: 'sig1',
        components: ['@method', '@path', '@authority', 'digest'],
        parameters: {
          created: new Date(1618884475 * 1000),
          expires: new Date(1618888075 * 1000),
          foo: 'ba;ra',
          zod: true,
        },
      });
    });

    it('should throw an error on an invalid Signature-Input header', () => {
      const header = 'sig1=("@method" "@path" "@authority" "digest");invalid=foo';
      expect(() => parseSignatureInputHeader(header)).to.throw(
        'Invalid Signature-Input header. Invalid value invalid=foo',
      );
    });

    it('should throw an error on an invalid Accept-Signature header', () => {
      const header = 'sig1=("@method" "@path" "@authority" "digest");invalid=foo';
      expect(() => parseAcceptSignatureHeader(header)).to.throw(
        'Invalid Accept-Signature header. Invalid value invalid=foo',
      );
    });

    it('should throw an error on an invalid components string', () => {
      const header = 'sig1=(@method, @path, @authority, digest);invalid=foo';
      expect(() => parseSignatureInputHeader(header)).to.throw(
        'Invalid Signature-Input header. Invalid value sig1=(@method, @path, @authority, digest)',
      );
    });
  });

  describe('parseSignatureHeader', () => {
    it('should parse a valid Signature header', () => {
      const key = 'sig1';
      const header = 'sig1=:YWJjMTIzZGVmNDU2:';

      const result = parseSignatureHeader(key, header);
      expect(result).to.deep.equal(new Uint8Array([97, 98, 99, 49, 50, 51, 100, 101, 102, 52, 53, 54]));
    });

    it('should throw an error on a key mismatch', () => {
      const key = 'sig1';
      const header = 'wrong-key=:YWJjMTIzZGVmNDU2:';

      expect(() => parseSignatureHeader(key, header)).to.throw(
        'Invalid Signature header. Key mismatch wrong-key !== sig1',
      );
    });
  });
});
