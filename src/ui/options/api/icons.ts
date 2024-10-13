import iconsList from '../../../icon-list.json';
const iconsListTyped = iconsList as Record<string, string>;

const blacklist = ['_light', '_highContrast'];

export function getListOfFileIcons(): string[] {
  return Object.keys(iconsListTyped)
    .filter(
      (name) =>
        !name.startsWith('folder') &&
        !blacklist.some((term) => name.includes(term))
    )
    .sort();
}

export function getListOfFolderIcons(): string[] {
  return Object.keys(iconsListTyped)
    .filter(
      (name) =>
        name.startsWith('folder') &&
        !name.includes('-open') &&
        !blacklist.some((term) => name.includes(term))
    )
    .map((name) => name.replace('folder-', ''))
    .sort();
}
