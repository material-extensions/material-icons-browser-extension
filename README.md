<h1 align="center">Material Icons for GitHub</h1>

![Dark GitHub example](/assets/example_dark.png)
![Light GitHub example](/assets/example_light.png)

  <img src="https://github.com/Claudiohbsantos/github-material-icons-extension/raw/master/assets/chrome-web-store.png">

**Install directly from the [Chrome Web Store]()**


---

### About

Material Icons for GitHub is a Chrome Extension that enhances repositories file browsers. Replace default file/folder icons with material design icons tailored to each file type, tool and purpose in the project.

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

Rebuild extension logos from `src/logo.svg`. _This script needs [Inkscape](https://inkscape.org/) to be available on PATH_

```shell
npm run rebuild-logos
```

---

*Original extension developed with [Richard Lam](https://github.com/rlam108)*
