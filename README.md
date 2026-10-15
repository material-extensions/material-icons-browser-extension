<h1 align="center">Material Icons for GitHub</h1>

<div align="center">

![Dark GitHub example](/assets/example-dark.png)
![Light GitHub example](/assets/example-light.png)

<p align="center">
  <a href="https://chrome.google.com/webstore/detail/material-icons-for-github/bggfcpfjbdkhfhfmkjpbhnkhnpjjeomc"><img src="https://github.com/material-extensions/material-icons-browser-extension/raw/main/assets/chrome-web-store.png"></a>
  <a href="https://addons.mozilla.org/firefox/addon/material-icons-for-github/"><img src="https://github.com/material-extensions/material-icons-browser-extension/raw/main/assets/firefox-addons.png"></a>
</p>

<b>Install directly from the <a href="https://chrome.google.com/webstore/detail/material-icons-for-github/bggfcpfjbdkhfhfmkjpbhnkhnpjjeomc">Chrome Web Store</a> | <a href="https://microsoftedge.microsoft.com/addons/detail/fmnacigfpppckhpaafbjdhljbjjclkkj">Microsoft Edge Addons Store</a> | <a href="https://addons.mozilla.org/firefox/addon/material-icons-for-github/">Firefox Addons</a> | <a href="#safari-macos">Safari (build from source)</a></b></div>

---

<a href="https://github.com/material-extensions/vscode-material-icon-theme"><img src="https://img.shields.io/badge/last_built_with_vscode_theme-v5.39.0-blue" /></a>

<img valign="middle" src="https://img.shields.io/chrome-web-store/v/bggfcpfjbdkhfhfmkjpbhnkhnpjjeomc?label=Version%20Available%20in%20Chrome%20Store">

### About

Material Icons for GitHub is a browser Extension that enhances repositories file browsers when navigating github.com. Replace default file/folder icons with material design icons tailored to each file type, tool and purpose in the project.

Based and dependent on the popular [Material Icon Theme](https://github.com/material-extensions/vscode-material-icon-theme) extension for Visual Studio Code. All icons and file assignments on this project are pulled directly from that project, so any praise or design issues should be raised on the original repository.

### Managed icon bindings (Chrome/Edge)

Administrators can preset file and folder icon bindings through browser policy. Policy bindings apply to every domain, and bindings set in the extension options take precedence. For example, on Linux save this as `/etc/opt/chrome/policies/managed/material-icons.json`:

```json
{
  "3rdparty": {
    "extensions": {
      "bggfcpfjbdkhfhfmkjpbhnkhnpjjeomc": {
        "fileIconBindings": { "*.foo": "typescript" },
        "folderIconBindings": { "notes": "docs" }
      }
    }
  }
}
```

Check `chrome://policy` to confirm the browser loaded it.

### Safari (macOS)

There is no App Store release yet, but you can build and install it yourself with Xcode, Node.js 24.15+ and a free Apple account.

1. Build the extension and generate the Xcode project:

   ```shell
   npm install
   npm run package-safari
   ```

2. Open `out/safari/Material Icons for GitHub/Material Icons for GitHub.xcodeproj` in Xcode.
3. Add your Apple ID in **Xcode → Settings → Accounts**, then under **Signing & Capabilities** set **Team** to your Personal Team for the macOS app and macOS extension targets.
4. Select the **Material Icons for GitHub (macOS)** scheme and run it (⌘R). Move the built app to `/Applications` so the extension stays installed.
5. In **Safari → Settings → Extensions**, enable **Material Icons for GitHub** and allow it on github.com.

If the extension doesn't appear, enable **Settings → Advanced → Show features for web developers**, then **Settings → Developer → Allow unsigned extensions**. The iOS targets are generated too but untested.

Safari applies the page's Content Security Policy to extension URLs, so on Safari the icons are loaded as `data:` URLs through the background script.

### Build locally

```shell
npm run build
```

### Development

Build only files from `src` folder, without re-downloading dependencies from [Material Icon Theme](https://github.com/material-extensions/vscode-material-icon-theme)

```shell
npm run build-src
```

Rebuild extension logos from `src/logo.svg`. Only needed when `src/logo.svg` is changed.

```shell
npm run rebuild-logos
```

Zip `dist` folder for upload to Chrome Web Store and Firefox. _This script needs Zip to be available on PATH_

```shell
npm run bundle
```

Build a Safari Web Extension bundle in `dist/safari`:

```shell
npm run build-src
```

Package the Safari bundle into an Xcode project for local Safari testing or App Store distribution. This requires Xcode with `safari-web-extension-packager` available on PATH.

```shell
npm run package-safari
```

---

_Original extension developed with [Richard Lam](https://github.com/rlam108)_
