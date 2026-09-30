export type IconReplacementStatus =
  | 'loading'
  | 'active'
  | 'disabled'
  | 'unsupported'
  | 'error';

const STATUS_ATTRIBUTE = 'data-material-icons-extension-status';
const PROVIDER_ATTRIBUTE = 'data-material-icons-extension-provider';

export function setExtensionStatus(status: IconReplacementStatus | null) {
  if (status) {
    document.documentElement.setAttribute(STATUS_ATTRIBUTE, status);
    return;
  }

  document.documentElement.removeAttribute(STATUS_ATTRIBUTE);
}

export function setExtensionProvider(provider: string | null) {
  if (provider) {
    document.documentElement.setAttribute(PROVIDER_ATTRIBUTE, provider);
    return;
  }

  document.documentElement.removeAttribute(PROVIDER_ATTRIBUTE);
}
