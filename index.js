'use strict';

/**
  * @module index.js
  * @author John Butler
  * @description 
*/

const FileTree = require('./file_dsa/fileTree');

const t = new FileTree('b:/code/tdf/tdf_front_end/src');
const leaves = t.getFiles('b:/code/tdf/tdf_front_end/src/shared/util');

for (const leaf of leaves) {
	console.log(leaf.fileSpec);
}
