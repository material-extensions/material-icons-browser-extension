import languageMap from '../../../language-map.json';

const languageMapTyped = languageMap as {
  fileExtensions: Record<string, string>;
  fileNames: Record<string, string>;
};

/**
 * Get list of all supported language ids.
 *
 * @returns a list of language ids
 */
export function getLanguageIds(): string[] {
  return Object.values(languageMapTyped.fileExtensions)
    .concat(Object.values(languageMapTyped.fileNames))
    .reduce((acc, curr) => {
      if (!acc.includes(curr)) {
        acc.push(curr);
      }
      return acc;
    }, [] as string[])
    .sort();
}
