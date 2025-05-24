export type Provider = {
  name: string;
  domains: { host: string; test: RegExp }[];
  selectors: {
    filename: string;
    icon: string;
    row: string;
    detect: string | null;
  };
  canSelfHost: boolean;
  isCustom: boolean;
  onAdd: (row: HTMLElement, callback: () => void) => void;
  getIsDirectory: (params: { row: HTMLElement; icon: HTMLElement }) => boolean;
  getIsSubmodule: (params: { row: HTMLElement; icon: HTMLElement }) => boolean;
  getIsSymlink: (params: { row: HTMLElement; icon: HTMLElement }) => boolean;
  getisGitHubWorkflowDir?: (params: {
    row: HTMLElement;
    icon: HTMLElement;
  }) => boolean;
  getIsGitHubActionsWorkflowFile?: (params: {
    row: HTMLElement;
    icon: HTMLElement;
  }) => boolean;
  getIsLightTheme: () => boolean;
  replaceIcon: (oldIcon: HTMLElement, newIcon: HTMLElement) => void;
  transformFileName: (
    rowEl: HTMLElement,
    iconEl: HTMLElement,
    fileName: string
  ) => string;
};

export type Domain = Pick<Provider, 'name' | 'isCustom'> & {
  isDefault: boolean;
};

export type ProviderMap = Record<string, string>;
