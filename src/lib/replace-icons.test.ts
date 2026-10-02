import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Provider } from '../models';
import { observePage, replaceAllIcons } from './replace-icons';

// Mock webextension-polyfill
vi.mock('webextension-polyfill', () => ({
  default: {
    runtime: {
      getURL: (name: string) => `chrome-extension://test-id/${name}`,
    },
  },
}));

// Mock icon-list.json
vi.mock('../icon-list.json', () => ({
  default: {
    file: 'file.svg',
    folder: 'folder.svg',
    typescript: 'typescript.svg',
  },
}));

function createMockProvider(overrides: Partial<Provider> = {}): Provider {
  return {
    name: 'test',
    domains: [{ host: 'test.com', test: /^test\.com$/ }],
    selectors: {
      row: '.row',
      filename: '.filename',
      icon: '.icon',
      detect: null,
    },
    canSelfHost: false,
    isCustom: false,
    onAdd: () => {},
    getIsDirectory: () => false,
    getIsSubmodule: () => false,
    getIsSymlink: () => false,
    getIsLightTheme: () => false,
    replaceIcon: vi.fn(),
    transformFileName: (_row, _icon, fileName) => fileName,
    ...overrides,
  };
}

const waitForMutationObserver = () =>
  new Promise((resolve) => setTimeout(resolve, 0));

describe('observePage', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('should replace icons in rows that already exist when observation starts', () => {
    document.body.innerHTML = `
      <div class="row">
        <span class="filename">src</span>
        <svg class="icon octicon-file-directory-fill"></svg>
      </div>
    `;
    const provider = createMockProvider({
      getIsDirectory: () => true,
    });

    observePage(provider, 'react');

    expect(provider.replaceIcon).toHaveBeenCalledTimes(1);
    const newIcon = (provider.replaceIcon as ReturnType<typeof vi.fn>).mock
      .calls[0][1] as HTMLElement;
    expect(newIcon.getAttribute('data-material-icons-extension-iconname')).toBe(
      'folder.svg'
    );
    expect(newIcon.getAttribute('data-material-icons-extension-filename')).toBe(
      'src'
    );
  });

  it('should replace icons in rows that are added dynamically', async () => {
    const provider = createMockProvider();

    observePage(provider, 'react');

    document.body.insertAdjacentHTML(
      'beforeend',
      `
        <div class="row">
          <span class="filename">index.ts</span>
          <svg class="icon octicon-file"></svg>
        </div>
      `
    );
    await waitForMutationObserver();

    expect(provider.replaceIcon).toHaveBeenCalledTimes(1);
    const newIcon = (provider.replaceIcon as ReturnType<typeof vi.fn>).mock
      .calls[0][1] as HTMLElement;
    expect(newIcon.getAttribute('data-material-icons-extension-filename')).toBe(
      'index.ts'
    );
  });

  it('should not register provider onAdd callbacks multiple times for the same row', async () => {
    const onAdd = vi.fn();
    const provider = createMockProvider({ onAdd });

    document.body.innerHTML = `
      <div class="row">
        <span class="filename">index.ts</span>
        <svg class="icon octicon-file"></svg>
      </div>
    `;

    observePage(provider, 'react');

    document.querySelector('.row')?.append(document.createElement('span'));
    await waitForMutationObserver();

    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it('should not reprocess a row because of its own inserted icon', async () => {
    // Azure keeps the original icon element and puts the new <img> inside it.
    // The cap stops the test from hanging if the loop comes back.
    let calls = 0;
    const provider = createMockProvider({
      replaceIcon: vi.fn((iconEl: HTMLElement, newIcon: HTMLElement) => {
        calls++;
        if (calls < 20) iconEl.replaceChildren(newIcon);
      }),
    });

    document.body.innerHTML = `
      <div class="row">
        <span class="filename">index.ts</span>
        <span class="icon"></span>
      </div>
    `;

    observePage(provider, 'react');

    document.querySelector('.row')?.classList.add('selected');
    for (let i = 0; i < 5; i++) await waitForMutationObserver();

    expect(calls).toBeLessThan(5);
  });
});

describe('replaceAllIcons', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('should call replaceIcon for each element with data-material-icons-extension-iconname', () => {
    const provider = createMockProvider();

    document.body.innerHTML = `
      <svg data-material-icons-extension-iconname="typescript.svg" data-material-icons-extension-filename="index.ts"></svg>
      <svg data-material-icons-extension-iconname="folder.svg" data-material-icons-extension-filename="src"></svg>
    `;

    replaceAllIcons(provider);

    expect(provider.replaceIcon).toHaveBeenCalledTimes(2);
  });

  it('should not call replaceIcon for elements without iconname attribute', () => {
    const provider = createMockProvider();

    document.body.innerHTML = `
      <svg class="octicon octicon-file"></svg>
      <svg data-material-icons-extension="icon"></svg>
    `;

    replaceAllIcons(provider);

    expect(provider.replaceIcon).not.toHaveBeenCalled();
  });

  it('should skip elements with empty iconname', () => {
    const provider = createMockProvider();

    document.body.innerHTML = `
      <svg data-material-icons-extension-iconname="" data-material-icons-extension-filename="test.ts"></svg>
    `;

    replaceAllIcons(provider);

    expect(provider.replaceIcon).not.toHaveBeenCalled();
  });

  it('should pass correct iconName and fileName to replaceElementWithIcon', () => {
    const provider = createMockProvider();

    document.body.innerHTML = `
      <svg data-material-icons-extension-iconname="typescript.svg" data-material-icons-extension-filename="app.ts"></svg>
    `;

    replaceAllIcons(provider);

    expect(provider.replaceIcon).toHaveBeenCalledTimes(1);
    const newIcon = (provider.replaceIcon as ReturnType<typeof vi.fn>).mock
      .calls[0][1] as HTMLElement;
    expect(newIcon.getAttribute('data-material-icons-extension-iconname')).toBe(
      'typescript.svg'
    );
    expect(newIcon.getAttribute('data-material-icons-extension-filename')).toBe(
      'app.ts'
    );
    expect(newIcon.getAttribute('src')).toBe(
      'chrome-extension://test-id/typescript.svg'
    );
  });

  it('should work with img elements (other providers)', () => {
    const provider = createMockProvider();

    document.body.innerHTML = `
      <img data-material-icons-extension-iconname="typescript.svg" data-material-icons-extension-filename="index.ts" src="chrome-extension://old/typescript.svg">
    `;

    replaceAllIcons(provider);

    expect(provider.replaceIcon).toHaveBeenCalledTimes(1);
  });

  it('should handle missing filename attribute gracefully', () => {
    const provider = createMockProvider();

    document.body.innerHTML = `
      <svg data-material-icons-extension-iconname="typescript.svg"></svg>
    `;

    replaceAllIcons(provider);

    expect(provider.replaceIcon).toHaveBeenCalledTimes(1);
    const newIcon = (provider.replaceIcon as ReturnType<typeof vi.fn>).mock
      .calls[0][1] as HTMLElement;
    expect(newIcon.getAttribute('data-material-icons-extension-filename')).toBe(
      ''
    );
  });
});
