import { describe, it, expect, vi, beforeEach } from 'vitest';
import github from './github';
import { replaceIconInRow } from '../lib/replace-icon';
import { Manifest } from 'material-icon-theme';

// Mock webextension-polyfill
vi.mock('webextension-polyfill', () => ({
  default: {
    runtime: {
      getURL: (name: string) =>
        `chrome-extension://material-icons-ext-id/${name}`,
    },
  },
}));

// Mock icon-list.json with common icons
vi.mock('../icon-list.json', () => ({
  default: {
    file: 'file.svg',
    folder: 'folder.svg',
    'folder-open': 'folder-open.svg',
    'folder-src': 'folder-src.svg',
    'folder-src-open': 'folder-src-open.svg',
    typescript: 'typescript.svg',
    javascript: 'javascript.svg',
    json: 'json.svg',
    readme: 'readme.svg',
    git: 'git.svg',
    'folder-github': 'folder-github.svg',
    'folder-github-open': 'folder-github-open.svg',
    'folder-node': 'folder-node.svg',
    'folder-node-open': 'folder-node-open.svg',
  },
}));

const manifest: Manifest = {
  fileNames: {
    'package.json': 'json',
    'README.md': 'readme',
    '.gitignore': 'git',
  },
  fileExtensions: {
    ts: 'typescript',
    js: 'javascript',
    json: 'json',
  },
  languageIds: {},
  folderNames: {
    src: 'folder-src',
    // biome-ignore lint/style/useNamingConvention: real folder name
    node_modules: 'folder-node',
    '.github': 'folder-github',
  },
  folderNamesExpanded: {
    src: 'folder-src-open',
    // biome-ignore lint/style/useNamingConvention: real folder name
    node_modules: 'folder-node-open',
    '.github': 'folder-github-open',
  },
};

const provider = github();

describe('GitHub provider - DOM snapshots', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('file icon replacement', () => {
    it('should produce correct DOM for a TypeScript file', () => {
      document.body.innerHTML = `
        <div class="PRIVATE_TreeView-item-content">
          <div class="PRIVATE_TreeView-item-visual" aria-hidden="true">
            <svg data-component="Octicon" aria-hidden="true" focusable="false"
              class="octicon octicon-file" viewBox="0 0 16 16" width="16" height="16"
              fill="currentColor" display="inline-block" overflow="visible"
              style="vertical-align: text-bottom;">
              <path d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0 1 13.25 16h-9.5A1.75 1.75 0 0 1 2 14.25Zm1.75-.25a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h9.5a.25.25 0 0 0 .25-.25V6h-2.75A1.75 1.75 0 0 1 9 4.25V1.5Zm6.75.062V4.25c0 .138.112.25.25.25h2.688l-.011-.013-2.914-2.914-.013-.011Z"></path>
            </svg>
          </div>
          <span class="PRIVATE_TreeView-item-content-text">
            <span>index.ts</span>
          </span>
        </div>
      `;

      const row = document.querySelector(
        '.PRIVATE_TreeView-item-content'
      ) as HTMLElement;
      replaceIconInRow(row, provider, manifest);

      expect(row.innerHTML).toMatchSnapshot();
    });

    it('should produce correct DOM for a JSON file', () => {
      document.body.innerHTML = `
        <div class="PRIVATE_TreeView-item-content">
          <div class="PRIVATE_TreeView-item-visual" aria-hidden="true">
            <svg data-component="Octicon" aria-hidden="true" focusable="false"
              class="octicon octicon-file" viewBox="0 0 16 16" width="16" height="16"
              fill="currentColor" display="inline-block" overflow="visible"
              style="vertical-align: text-bottom;">
              <path d="M2 1.75C2 .784 2.784 0 3.75 0h6.586..."></path>
            </svg>
          </div>
          <span class="PRIVATE_TreeView-item-content-text">
            <span>package.json</span>
          </span>
        </div>
      `;

      const row = document.querySelector(
        '.PRIVATE_TreeView-item-content'
      ) as HTMLElement;
      replaceIconInRow(row, provider, manifest);

      expect(row.innerHTML).toMatchSnapshot();
    });

    it('should produce correct DOM for README.md', () => {
      document.body.innerHTML = `
        <div class="PRIVATE_TreeView-item-content">
          <div class="PRIVATE_TreeView-item-visual" aria-hidden="true">
            <svg data-component="Octicon" aria-hidden="true" focusable="false"
              class="octicon octicon-file" viewBox="0 0 16 16" width="16" height="16"
              fill="currentColor" display="inline-block" overflow="visible"
              style="vertical-align: text-bottom;">
              <path d="M2 1.75C2 .784..."></path>
            </svg>
          </div>
          <span class="PRIVATE_TreeView-item-content-text">
            <span>README.md</span>
          </span>
        </div>
      `;

      const row = document.querySelector(
        '.PRIVATE_TreeView-item-content'
      ) as HTMLElement;
      replaceIconInRow(row, provider, manifest);

      expect(row.innerHTML).toMatchSnapshot();
    });
  });

  describe('folder icon replacement (closed)', () => {
    it('should produce correct DOM for a closed src folder', () => {
      document.body.innerHTML = `
        <div class="PRIVATE_TreeView-item-content">
          <div class="PRIVATE_TreeView-item-visual" aria-hidden="true">
            <div class="PRIVATE_TreeView-directory-icon">
              <svg data-component="Octicon" aria-hidden="true" focusable="false"
                class="octicon octicon-file-directory-fill" viewBox="0 0 16 16" width="16" height="16"
                fill="currentColor" display="inline-block" overflow="visible"
                style="vertical-align: text-bottom;">
                <path d="M1.75 1A1.75 1.75 0 0 0 0 2.75v10.5C0 14.216.784 15 1.75 15h12.5A1.75 1.75 0 0 0 16 13.25v-8.5A1.75 1.75 0 0 0 14.25 3H7.5a.25.25 0 0 1-.2-.1l-.9-1.2C6.07 1.26 5.55 1 5 1H1.75Z"></path>
              </svg>
            </div>
          </div>
          <span class="PRIVATE_TreeView-item-content-text">
            <span>src</span>
          </span>
        </div>
      `;

      const row = document.querySelector(
        '.PRIVATE_TreeView-item-content'
      ) as HTMLElement;
      replaceIconInRow(row, provider, manifest);

      expect(row.innerHTML).toMatchSnapshot();
    });

    it('should produce correct DOM for a closed node_modules folder', () => {
      document.body.innerHTML = `
        <div class="PRIVATE_TreeView-item-content">
          <div class="PRIVATE_TreeView-item-visual" aria-hidden="true">
            <div class="PRIVATE_TreeView-directory-icon">
              <svg data-component="Octicon" aria-hidden="true" focusable="false"
                class="octicon octicon-file-directory-fill" viewBox="0 0 16 16" width="16" height="16"
                fill="currentColor" display="inline-block" overflow="visible"
                style="vertical-align: text-bottom;">
                <path d="M1.75 1A1.75 1.75 0 0 0 0 2.75v10.5C0 14.216..."></path>
              </svg>
            </div>
          </div>
          <span class="PRIVATE_TreeView-item-content-text">
            <span>node_modules</span>
          </span>
        </div>
      `;

      const row = document.querySelector(
        '.PRIVATE_TreeView-item-content'
      ) as HTMLElement;
      replaceIconInRow(row, provider, manifest);

      expect(row.innerHTML).toMatchSnapshot();
    });
  });

  describe('folder icon replacement (expanded)', () => {
    it('should produce correct DOM for an expanded src folder', () => {
      document.body.innerHTML = `
        <div class="PRIVATE_TreeView-item-content">
          <div class="PRIVATE_TreeView-item-visual" aria-hidden="true">
            <div class="PRIVATE_TreeView-directory-icon">
              <svg data-component="Octicon" aria-hidden="true" focusable="false"
                class="octicon octicon-file-directory-open-fill" viewBox="0 0 16 16" width="16" height="16"
                fill="currentColor" display="inline-block" overflow="visible"
                style="vertical-align: text-bottom;">
                <path d="M.513 1.513A1.75 1.75 0 0 1 1.75 1h3.5c.55 0 1.07.26 1.4.7l.9 1.2a.25.25 0 0 0 .2.1h6.5A1.75 1.75 0 0 1 16 4.75v8.5A1.75 1.75 0 0 1 14.25 15H1.75A1.75 1.75 0 0 1 0 13.25V2.75c0-.464.184-.91.513-1.237Z"></path>
              </svg>
            </div>
          </div>
          <span class="PRIVATE_TreeView-item-content-text">
            <span>src</span>
          </span>
        </div>
      `;

      const row = document.querySelector(
        '.PRIVATE_TreeView-item-content'
      ) as HTMLElement;
      replaceIconInRow(row, provider, manifest);

      expect(row.innerHTML).toMatchSnapshot();
    });

    it('should produce correct DOM for an expanded .github folder', () => {
      document.body.innerHTML = `
        <div class="PRIVATE_TreeView-item-content">
          <div class="PRIVATE_TreeView-item-visual" aria-hidden="true">
            <div class="PRIVATE_TreeView-directory-icon">
              <svg data-component="Octicon" aria-hidden="true" focusable="false"
                class="octicon octicon-file-directory-open-fill" viewBox="0 0 16 16" width="16" height="16"
                fill="currentColor" display="inline-block" overflow="visible"
                style="vertical-align: text-bottom;">
                <path d="M.513 1.513A1.75 1.75 0 0 1 1.75 1h3.5c.55 0 1.07..."></path>
              </svg>
            </div>
          </div>
          <span class="PRIVATE_TreeView-item-content-text">
            <span>.github</span>
          </span>
        </div>
      `;

      const row = document.querySelector(
        '.PRIVATE_TreeView-item-content'
      ) as HTMLElement;
      replaceIconInRow(row, provider, manifest);

      expect(row.innerHTML).toMatchSnapshot();
    });
  });

  describe('full tree view structure', () => {
    it('should produce correct DOM for a complete file tree', () => {
      document.body.innerHTML = `
        <ul role="tree" aria-label="Files" class="prc-TreeView-TreeViewRootUlStyles">
          <li class="PRIVATE_TreeView-item" role="treeitem" aria-expanded="true">
            <div class="PRIVATE_TreeView-item-content">
              <div class="PRIVATE_TreeView-item-visual" aria-hidden="true">
                <div class="PRIVATE_TreeView-directory-icon">
                  <svg data-component="Octicon" aria-hidden="true" focusable="false"
                    class="octicon octicon-file-directory-open-fill" viewBox="0 0 16 16" width="16" height="16"
                    fill="currentColor" display="inline-block" overflow="visible"
                    style="vertical-align: text-bottom;">
                    <path d="M.513 1.513A1.75..."></path>
                  </svg>
                </div>
              </div>
              <span class="PRIVATE_TreeView-item-content-text">
                <span>src</span>
              </span>
            </div>
          </li>
          <li class="PRIVATE_TreeView-item" role="treeitem">
            <div class="PRIVATE_TreeView-item-content">
              <div class="PRIVATE_TreeView-item-visual" aria-hidden="true">
                <svg data-component="Octicon" aria-hidden="true" focusable="false"
                  class="octicon octicon-file" viewBox="0 0 16 16" width="16" height="16"
                  fill="currentColor" display="inline-block" overflow="visible"
                  style="vertical-align: text-bottom;">
                  <path d="M2 1.75C2 .784..."></path>
                </svg>
              </div>
              <span class="PRIVATE_TreeView-item-content-text">
                <span>index.ts</span>
              </span>
            </div>
          </li>
          <li class="PRIVATE_TreeView-item" role="treeitem">
            <div class="PRIVATE_TreeView-item-content">
              <div class="PRIVATE_TreeView-item-visual" aria-hidden="true">
                <svg data-component="Octicon" aria-hidden="true" focusable="false"
                  class="octicon octicon-file" viewBox="0 0 16 16" width="16" height="16"
                  fill="currentColor" display="inline-block" overflow="visible"
                  style="vertical-align: text-bottom;">
                  <path d="M2 1.75C2 .784..."></path>
                </svg>
              </div>
              <span class="PRIVATE_TreeView-item-content-text">
                <span>package.json</span>
              </span>
            </div>
          </li>
          <li class="PRIVATE_TreeView-item" role="treeitem">
            <div class="PRIVATE_TreeView-item-content">
              <div class="PRIVATE_TreeView-item-visual" aria-hidden="true">
                <svg data-component="Octicon" aria-hidden="true" focusable="false"
                  class="octicon octicon-file" viewBox="0 0 16 16" width="16" height="16"
                  fill="currentColor" display="inline-block" overflow="visible"
                  style="vertical-align: text-bottom;">
                  <path d="M2 1.75C2 .784..."></path>
                </svg>
              </div>
              <span class="PRIVATE_TreeView-item-content-text">
                <span>.gitignore</span>
              </span>
            </div>
          </li>
        </ul>
      `;

      // Process each row
      const rows = document.querySelectorAll('.PRIVATE_TreeView-item-content');
      for (const row of rows) {
        replaceIconInRow(row as HTMLElement, provider, manifest);
      }

      const tree = document.querySelector('[role="tree"]') as HTMLElement;
      expect(tree.innerHTML).toMatchSnapshot();
    });

    it('should produce correct DOM for the react-directory-filename-column layout', () => {
      document.body.innerHTML = `
        <div class="react-directory-filename-column">
          <svg data-component="Octicon" aria-hidden="true" focusable="false"
            class="octicon octicon-file" viewBox="0 0 16 16" width="16" height="16"
            fill="currentColor" display="inline-block" overflow="visible"
            style="vertical-align: text-bottom;">
            <path d="M2 1.75C2 .784..."></path>
          </svg>
          <a href="/repo/blob/main/app.js">app.js</a>
        </div>
      `;

      const row = document.querySelector(
        '.react-directory-filename-column'
      ) as HTMLElement;
      replaceIconInRow(row, provider, manifest);

      expect(row.innerHTML).toMatchSnapshot();
    });
  });
});
