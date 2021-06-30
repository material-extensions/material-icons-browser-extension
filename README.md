<h1 align="center">Material Icons for GitHub</h1>

<div align="center">

![Dark GitHub example](/assets/example_dark.png)
![Light GitHub example](/assets/example_light.png)

<p align="center">
  <a href="https://chrome.google.com/webstore/detail/material-icons-for-github/bggfcpfjbdkhfhfmkjpbhnkhnpjjeomc"><img src="https://github.com/Claudiohbsantos/github-material-icons-extension/raw/master/assets/chrome-web-store.png"></a>
  <a href="https://addons.mozilla.org/en-US/firefox/addon/material-icons-for-github/"><img src="https://github.com/Claudiohbsantos/github-material-icons-extension/raw/master/assets/firefox-addon.png"></a>
</p>

<b>Install directly from the <a href="https://chrome.google.com/webstore/detail/material-icons-for-github/bggfcpfjbdkhfhfmkjpbhnkhnpjjeomc">Chrome Web Store</a> | <a href="https://microsoftedge.microsoft.com/addons/detail/material-icons-for-github/khckkdgomkcjjnpgjmdmbceiddlmiolb">Microsoft Edge Addons Store</a> | <a href="https://addons.mozilla.org/en-US/firefox/addon/material-icons-for-github/">Firefox Addons</a></b></div>

---

### About

Material Icons for GitHub is a browser Extension that enhances repositories file browsers when navigating github.com. Replace default file/folder icons with material design icons tailored to each file type, tool and purpose in the project.

Based and dependent on the popular [Material Icon Theme](https://github.com/PKief/vscode-material-icon-theme) extension for Visual Studio Code. All icons and file assignments on this project are pulled directly from that project, so any praise or design issues should be raised on the original repository.

### Development

Clone this repository and install dependencies

```shell
git clone https://github.com/Claudiohbsantos/github-material-icons-extension.git
cd github-material-icons-extension
npm install
```

Build unpackaged extension for testing in `dist` directory

```shell
npm run build
```

Build only files from `src` folder, without re-downloading dependencies from [Material Icon Theme](https://github.com/PKief/vscode-material-icon-theme)

```shell
npm run build-src
```

Rebuild extension logos from `src/logo.svg`.

```shell
npm run rebuild-logos
```

Zip `dist` folder for upload to Chrome Web Store and Firefox. _This script needs Zip to be available on PATH_

```shell
npm run bundle
```

---

_Original extension developed with [Richard Lam](https://github.com/rlam108)_
