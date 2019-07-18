# SNPRC Fork Notes (https://github.com/SNPRC/labkey-api-js)

This is the SNPRC forked version of labkey-api-js. Changes were made to support baseURL configuration and CORS headers. 

Currently, Query.selectRows (Rows.ts) has been changed to create absolute URLs and pass credentials for CORS headers. Future plans include refactoring BuildURL in ActionURL.ts to handle 
absolute vs. relative paths for all API calls. However, this will require more testing than we are willing to do at this time, so we are addressing APIs on an as needed basis.

# LabKey Server (Tomcat) configuration to enable CORS

```xml
 <filter>
    <filter-name>CorsFilter</filter-name>
      <filter-class>org.apache.catalina.filters.CorsFilter</filter-class>
	  <init-param>
	    <param-name>cors.allowed.headers</param-name>
		<param-value>Content-Type,X-Requested-With,accept,Origin,Access-Control-RequestMethod,Access-Control-Request-Headers,Authorization,dsName,x-labkey-csrf,dnt</param-value>
	  </init-param>
	  <init-param>
		<param-name>cors.support.credentials</param-name>
		<param-value>true</param-value>
	  </init-param>
	  <init-param>
        <param-name>cors.allowed.origins</param-name>
        <param-value>https://fully.qualified.name:8443, ... </param-value>
      </init-param>
	  <init-param>
          <param-name>debug</param-name>
          <param-value>0</param-value>
      </init-param>
	  <init-param>
        <param-name>cors.allowed.methods</param-name>
        <param-value>GET,POST,PUT,HEAD,OPTIONS</param-value>
    </init-param>
</filter>
<filter-mapping>
    <filter-name>CorsFilter</filter-name>
    <url-pattern>/*</url-pattern>
</filter-mapping>

```
## Notes:
1. Credential support is required for the API.
2. White listing of allowed origins is required when credential support is enabled.
3. Custom headers, such as **x-labkey-csrf** and **dnt** must be included in the allowed headers list, since they are sent to the server by the API.

# Basic API configuration (index.html)

```xml
<!DOCTYPE html>
<html>

<head>
    <title>LabKey-api-js dev</title>
    <script src="https://code.jquery.com/jquery-3.4.1.min.js"></script>   
</head>

<body>
    <p>LabKey JS API Project</p>
    <script>
        LABKEY = {
            contextPath: '/labkey',
            container: {path: 'SNPRC'}, 
            baseURL: 'https://moe.txbiomed.org'
        }
    </script>

    <div id="app"></div>
    <script type="text/javascript" src="bundle.js"></script>
</body>

</html>
```
## Notes:
1. jquery is required by the API
2. contextPath requires the leading **/**
3. **baseURL** is the LabKey server being queried

#
# LabKey/labkey-api-js `README.MD` (https://github.com/LabKey/labkey-api-js)

# @labkey/api

JavaScript package for interacting with [LabKey Server](https://www.labkey.com/). The goal for this package is to provide a robust set of JavaScript tools for working with LabKey Servers. Our hope is to have it working in the browser, on the server, and in pretty much any modern JavaScript environment.

Written with joy in TypeScript.

## v0.0.17 - Alpha

This package is under development. We're preparing the 1.0.0 release but in the meantime treat this package as experimental. All code is subject to change.

## Installation

The easiest way to use @labkey/api is to install it from npm and bundle it with your app. Before you run install you'll want to make sure you set the appropriate registry for the `@labkey` scope.

#### Setting the Registry Scope

This package is currently availble on LabKey's Artifactory package registry. To include this package set the registry in npm for the `@labkey` scope. This can be done via command line using `npm config`:
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

If you would like to contribute changes to this package it is straight-forward to get setup for development. First, clone this repository to a directory

```sh
git clone https://github.com/LabKey/labkey-api-js.git # or via ssh
```

Navigate into the package directory and run the following commands

```sh
npm install
npm run build
```

Now that the distribution is built you can load it up by serving the index.html file found in the package root. To serve it up from IntelliJ you can "Open in Browser". This will let you explore the API as it is exposed via the `LABKEY` global namespace.

### Running against a LabKey Server

If you would like to experiment with running this code against LabKey Server it is possible thanks to the provided wrapper for the `LABKEY` global namespace. The following assumes you have a [LabKey development environment setup](https://www.labkey.org/Documentation/wiki-page.view?name=devMachine).

#### Deploy Using Experimental Build

To get started edit the `<labkey root>/server/modules/core/build.js` file and set `USE_LABKEY_API` to `true`.

```js
const USE_LABKEY_API = true;
```

Next, you can either perform a Gradle clean build or run the node portion of the build directly:

```sh
# From <labkey root>/server/modules/core
npm install
node build.js
```

Now you can startup the server and the code for the APIs will be supplied from this package.

#### Deploy From Source

Steps:
1. Navigate to `<labkey root>/server/api/webapp/` and clone this repository.
2. Navigate to the package directory and run `npm install` followed by `npm run build`.
3. Open `<labkey root>/server/api/webapp/clientapi_core.lib.xml` and replace the contents

```xml
<libraries xmlns="http://labkey.org/clientLibrary/xml/">
    <library compileInProductionMode="false">
        <script path="labkey-api-js/dist/labkey-api-js-core.min.js"/>
    </library>
</libraries>
```

Now you can startup the server and the code for the APIs will be supplied from this package.

## Publishing

To publish, increment the version number in accordance with [SemVer](https://semver.org/), update the Readme.md, and commit. Then from the package root run

```sh
npm publish
```
