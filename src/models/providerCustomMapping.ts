/**
 * Describes a custom mapping for a provider to match specific rows (folders/files)
 * and assign a custom icon name. Used for provider-specific special cases such as
 * workflow folders, configuration files, etc.
 *
 * @example
 * // Example: GitHub workflow folder mapping
 * const githubWorkflowFolderMapping: ProviderCustomMapping = {
 *   match: ({ row }) => {
 *     const anchor = row.querySelector('a');
 *     const href = anchor?.getAttribute('href');
 *     return href?.endsWith('.github/workflows') ?? false;
 *   },
 *   iconName: 'github-workflow-folder',
 * };
 *
 * @example
 * // Example: GitHub Actions workflow file mapping
 * const githubActionsWorkflowFileMapping: ProviderCustomMapping = {
 *   match: ({ row }) => {
 *     const anchor = row.querySelector('a');
 *     const href = anchor?.getAttribute('href');
 *     return /\.github\/workflows\/.*\.ya?ml$/.test(href ?? '');
 *   },
 *   iconName: 'github-actions-workflow',
 * };
 */
export type ProviderCustomMapping = {
  /**
   * Function to determine if this mapping applies to the given row/icon.
   * @param params - The row and optional icon element to check.
   * @returns true if the mapping should be applied, false otherwise.
   */
  match: (params: { row: HTMLElement; icon?: HTMLElement }) => boolean;
  /**
   * The icon name to use if the match function returns true.
   */
  iconName: string;
};
