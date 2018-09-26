# Manager Webpack Config

Extensible webpack configuration for the OVH Manager.

## Usage

The webpack configuration can be imported and extended in the manager.
To import the configuration, simply add manager-webpack-config as a devDependency :

```bash
yarn add -D @ovh-ux/manager-webpack-config
```

In order to use and extends this configuration, some manager relative parameters needs
to be provided. Please refer to the parameters and example below.

### Parameters

The following configuration parameters needs to be _provided_ :

 - _template_: path to manager main template file
 - _basePath_: the base path of the manager
 - _lessPath_: manager paths containing less files
 - _root_: root path of the manager
 - _assets.files_: see https://github.com/webpack-contrib/copy-webpack-plugin

The following configuration parameters are _optionals_ :
 - _assets.options_: see https://github.com/webpack-contrib/copy-webpack-plugin
 - _translationsRoot_: by default, ui-router-translation loader resolves translations
   relatively to the current resource path. You can override this behavior by providing
   an absolute translationsRoot path. This path will then be used to resolve translations
   instead of current resource path.

### Example

```js
// import config and initialize parameters
const { config } = require('@ovh-ux/manager-webpack-config')({
  template: './client/index.html',
  basePath: './client',
  lessPath: [
    './client/app',
    './client/components',
    './node_modules',
  ],
  root: path.resolve(__dirname, './client/app'),
  assets: {
    files: [
      { from: path.resolve(__dirname, './client/app/common/assets'), to: 'assets' },
    ],
  },
});

// merge the configuration and export it
module.exports = merge(config, {
  entry: _.assign({
    main: './client/app/index.js',
  }),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js',
  },
});
```
