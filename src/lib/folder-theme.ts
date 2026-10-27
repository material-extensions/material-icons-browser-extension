export const folderThemes = ['specific', 'classic'] as const;

export type FolderTheme = (typeof folderThemes)[number];

export function normalizeFolderTheme(value: unknown): FolderTheme {
  return folderThemes.includes(value as FolderTheme)
    ? (value as FolderTheme)
    : 'specific';
}
