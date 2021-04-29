# smartclide-service-creation-theia

## Getting started

Install [nvm](https://github.com/creationix/nvm#install-script).

    curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.5/install.sh | bash

Install npm and node.

    nvm install 10
    nvm use 10

Install yarn.

    npm install -g yarn

## Running the browser example

    yarn start:browser

*or:*

    yarn rebuild:browser
    cd browser-app
    yarn start

*or:* launch `Start Browser Backend` configuration from VS code.

Open http://localhost:3000 in the browser.

## Running the Electron example

    yarn start:electron

*or:*

    yarn rebuild:electron
    cd electron-app
    yarn start

*or:* launch `Start Electron Backend` configuration from VS code.