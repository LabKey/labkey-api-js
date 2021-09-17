# @labkey/api

[API Docs](https://labkey.github.io/labkey-api-js/) | [Change Log](https://github.com/LabKey/labkey-api-js/blob/master/CHANGELOG.md) | [License](https://github.com/LabKey/labkey-api-js/blob/master/LICENSE) | [![Build Status](https://teamcity.labkey.org/app/rest/builds/buildType:(id:LabKey_Publishing_Client_JavaScriptApiTest)/statusIcon)](https://teamcity.labkey.org/viewType.html?buildTypeId=LabKey_Publishing_Client_JavaScriptApiTest)

JavaScript package for interacting with [LabKey Server](https://www.labkey.com/). The goal for this package is to 
provide a robust set of JavaScript tools for working with LabKey Servers. Our eventual hope is to have it working 
in the browser, on the server, and in pretty much any modern JavaScript environment. The package currently only 
supports use in the browser.

Written with joy in TypeScript.

## v1.0 - Official stable release

v1.0 is the first stable release of the `@labkey/api` package. This package is the official JavaScript API package for
LabKey Server and is included starting with LabKey Server v20.7. Release highlights:

- Replaces the original JavaScript API served under `LABKEY` global namespace on LabKey Server pages.
- Universal module definition (UMD) published package targeting ES6.
- Full fidelity TypeScript definitions.

### Pre-v1.0 usage

It is highly recommended you update to the 1.x version of this package as soon as possible. Any pre-1.0 releases are 
considered experimental and were used only for development purposes.

## Installation

The easiest way to use @labkey/api is to install it from npm and bundle it with your app. Before you run install 
you'll want to make sure you set the appropriate registry for the `@labkey` scope.

#### Setting the Registry Scope

This package is currently available on LabKey's Artifactory package registry. To include this package set the registry 
in npm for the `@labkey` scope. This can be done via command line using `npm config`:
```
npm config set @labkey:registry https://artifactory.labkey.com/artifactory/api/npm/libs-client
```
or via a `.npmrc` file
```
# .npmrc
@labkey:registry=https://artifactory.labkey.com/artifactory/api/npm/libs-client
```

#### Installing

To install using npm
```
npm install @labkey/api
```
You can then import @labkey/api in your application as follows:
```js
import { Query, Security } from '@labkey/api';
```

## Development

If you would like to contribute changes to this package it is straightforward to get set up for development. 
First, clone this repository to a directory

```sh
git clone https://github.com/LabKey/labkey-api-js.git # or via ssh
```

Navigate into the package directory and run the following commands

```sh
npm install
npm run build
```

Now that the distribution is built you can load it up by serving the index.html file found in the package root. To 
serve it up from IntelliJ you can "Open in Browser". This will let you explore the API as it is exposed via 
the `LABKEY` global namespace.

### Local LabKey Server

To make changes to this package and serve those changes from a local LabKey Server instance you
can do so via the following steps:

1. Build the package (as described above).
1. Copy the package's `/dist` directory to `/<labkey root>/server/modules/platform/core/node_modules/@labkey/api/dist`.
1. Navigate to `/<labkey root>/server/modules/platform/core`.
1. Run `node build.js` from the `core` module directory.

Your changes will now be included in the bundle served by your local LabKey Server instance.

#### Determining package version

If you're using this package from a LabKey Server page you can verify the package version being used by opening the 
browser console and typing:

```js
LABKEY.__package__
```

The `__package__` object will contain package information such as the version of the package you're using.

```js
// LABKEY.__package__
{
  description: "JavaScript client API for LabKey Server",
  name: "@labkey/api",
  version: "1.0.0"
}
```

## Publishing

To publish, increment the version number in accordance with [SemVer](https://semver.org/), update the CHANGELOG.md, 
and commit. Then from the package root run

```sh
npm publish
```
