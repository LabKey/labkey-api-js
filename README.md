# @labkey/api

JavaScript package for interacting with [LabKey Server](https://www.labkey.com/). The goal for this package is to provide a robust set of JavaScript tools for working with LabKey Servers. Our hope is to have it working in the browser, on the server, and in pretty much any modern JavaScript environment.

Written with joy in TypeScript.

## v0.0.6 - Alpha

This package is under development. We're preparing the 1.0.0 release but in the meantime treat this package as experimental. All code is subject to change.

## Installation

The easiest way to use @labkey/api is to install it from npm and bundle it with your app. Before you run install you'll want to make sure you set the appropriate registry for the `@labkey` scope.

#### Setting the Registry Scope

This package is currently availble on LabKey's Artifactory package registry. To include this package set the registry in npm for the `@labkey` scope. This can be done via command line using `npm config`:
```sh
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
