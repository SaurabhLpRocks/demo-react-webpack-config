/* eslint-disable import/no-commonjs  */
const path = require('path');

const root = path.resolve(__dirname, '..', '..', '..'); // Project root.
const webRoot = path.resolve(root, 'app', 'web');
const assetPath = path.resolve(root, 'web', 'dist');

module.exports = { root, webRoot, assetPath };
