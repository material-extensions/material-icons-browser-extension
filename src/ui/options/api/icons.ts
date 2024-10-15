import iconsList from '../../../icon-list.json';

const iconsListTyped = iconsList as Record<string, string>;
const blacklist = ['_light', '_highContrast'];

function isNotBlacklisted(name: string): boolean {
  return !blacklist.some((term) => name.includes(term));
}

function filterIcons(predicate: (name: string) => boolean): string[] {
  return Object.keys(iconsListTyped).filter(predicate).sort();
}

export function getIconFileName(
  iconName: string,
  isLightMode: boolean
): string {
  const lightIconName = `${iconName}_light`;
  if (isLightMode && iconsListTyped[lightIconName]) {
    return iconsListTyped[lightIconName];
  }
  return iconsListTyped[iconName];
}

export function getListOfFileIcons(): string[] {
  return filterIcons(
    (name) => !name.startsWith('folder') && isNotBlacklisted(name)
  );
}

export function getListOfFolderIcons(): string[] {
  return filterIcons(
    (name) =>
      name.startsWith('folder') &&
      !name.includes('-open') &&
      !name.includes('-root') &&
      isNotBlacklisted(name)
  ).map((name) => name.replace('folder-', ''));
}
