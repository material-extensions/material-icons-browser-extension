import { describe, expect, it } from 'vitest';
import {
  getExtensionOriginPattern,
  getProviderMatchDomains,
} from './url-patterns';

describe('url-patterns', () => {
  it('creates extension origin patterns without ports', () => {
    expect(getExtensionOriginPattern('http://localhost:3000/repo')).toBe(
      '*://localhost/*'
    );
    expect(getExtensionOriginPattern('https://192.168.2.71:3000/repo')).toBe(
      '*://192.168.2.71/*'
    );
    expect(getExtensionOriginPattern('https://git.example.test/repo')).toBe(
      '*://git.example.test/*'
    );
  });

  it('returns host and hostname for provider matching', () => {
    expect(getProviderMatchDomains('http://192.168.2.71:3000/repo')).toEqual([
      '192.168.2.71:3000',
      '192.168.2.71',
    ]);
  });
});
