# @labkey/api

JavaScript package for interacting with [LabKey Server](https://www.labkey.com/). The goal for this package is to 
provide a robust set of JavaScript tools for working with LabKey Servers. Our hope is to have it working in the 
browser, on the server, and in pretty much any modern JavaScript environment.

Written with joy in TypeScript.

## Usage Advisory

This package is under development. We're preparing the 1.0.0 release but in the meantime treat this package as 
experimental. All code is subject to change. See the [CHANGELOG](CHANGELOG.md) for changes in this version.

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

### Running against a LabKey Server

If you would like to experiment with running this code against LabKey Server it is possible thanks to the provided 
wrapper for the `LABKEY` global namespace. The following assumes you have a 
[LabKey development environment setup](https://www.labkey.org/Documentation/wiki-page.view?name=devMachine).

#### Deploy Using Experimental Flag

Starting in version LabKey v20.5 this package can be used in LabKey Server by enabling 
the "Use @labkey/api on the client-side" experimental feature.

You can verify the package version being used by opening the browser console and typing:

```js
LABKEY.__package__
```

If installed correctly, `__package__` will contain package information such as the version of the package you're using.

## Publishing

To publish, increment the version number in accordance with [SemVer](https://semver.org/), update the CHANGELOG.md, 
and commit. Then from the package root run

```sh
npm publish
```
