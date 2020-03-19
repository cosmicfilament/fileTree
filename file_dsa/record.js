'use strict';

/**
  * @module record.js
  * @author John Butler
  * @description 
*/

const { HashSet } = require('dsa.js');

class Record {
	constructor (fileSpec = null) {
		this.fileSpec = fileSpec;
		this.adjacents = new HashSet();
		this.stats = {};
		this.data = '';
	}

	// https://www.jstips.co/en/javascript/get-file-extension/ for the brilliant shift right trick
	getExtension () {
		return this.fileSpec === null
			? ''
			: this.fileSpec.slice(((this.fileSpec.lastIndexOf('.') - 1) >>> 0) + 2);
	}

	addAdjacent (node) {
		this.adjacents.add(node);
		return this;
	}

	removeAdjacent (node) {
		return this.adjacents.delete(node);
	}

	isAdjacent (node) {
		return this.adjacents.has(node);
	}

	getAdjacents () {
		return Array.from(this.adjacents);
	}

	print () {
		console.log(`FileSpec: ${this.fileSpec}`);
	}
}

module.exports = Record;
