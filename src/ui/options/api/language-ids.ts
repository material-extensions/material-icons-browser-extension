import { generateManifest } from 'material-icon-theme';

/**
 * Get list of all supported language ids.
 *
 * @returns a list of language ids
 */
export function getLanguageIds(): string[] {
  const manifest = generateManifest();
  return Object.keys(manifest.languageIds ?? {}).sort();
}
