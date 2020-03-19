'use strict';

/**
  * @module fileTree.js
  * @author John Butler
  * @description 
*/

const { HashMap, Stack } = require('dsa.js');
const { readdirSync, readFileSync, statSync } = require('fs');
const { VALID_EXTENSIONS } = require('./constants');
const Record = require('./record');

class FileTree {
	constructor (fileSpec) {
		this.fileSpec = fileSpec;
		this.recordList = new HashMap();
		return this._buildGraph();
	}

	static isValidDataFile (ext) {
		return VALID_EXTENSIONS.indexOf(ext) !== -1;
	}

	addVertex (fileSpec) {
		try {
			if (this.recordList.has(fileSpec)) {
				return this.recordList.get(fileSpec);
			}
			const vertex = new Record(fileSpec);
			// add the stats to the node object
			// returns false on fail
			vertex.stats = statSync(fileSpec);
			// if not directory then read in the file contents
			if (
				vertex.stats &&
				vertex.stats.isFile() &&
				FileTree.isValidDataFile(vertex.getExtension())
			) {
				vertex.data = readFileSync(fileSpec, 'utf8');
			}
			this.recordList.set(fileSpec, vertex);
			return vertex;
		} catch (error) {
			console.log(`addvertex: ${error}`);
			return '';
		}
	}

	removeVertex (fileSpec) {
		const current = this.recordList.get(fileSpec);
		if (current) {
			Array.from(this.recordList.values()).forEach(node => node.removeAdjacent(current));
		}
		return this.recordList.delete(value);
	}

	addEdge (source, destination) {
		const sourceRecord = this.addVertex(source);
		const destinationRecord = this.addVertex(destination);

		sourceRecord.addAdjacent(destinationRecord);
		destinationRecord.addAdjacent(sourceRecord);

		return [ sourceRecord, destinationRecord ];
	}

	removeEdge (source, destination) {
		const sourceRecord = this.recordList.get(source);
		const destinationRecord = this.recordList.get(destination);

		if (sourceRecord && destinationRecord) {
			sourceRecord.removeAdjacent(destinationRecord);
			destinationRecord.removeAdjacent(sourceRecord);
		}

		return [ sourceRecord, destinationRecord ];
	}

	_buildGraph (source = this.fileSpec) {
		try {
			const files = readdirSync(source);
			for (let file of files) {
				const dest = `${source}/${file}`;
				const [ sourceRecord, destinationRecord ] = this.addEdge(source, dest);

				destinationRecord.stats.isDirectory() && this._buildGraph(dest);
			}
		} catch (error) {
			console.log(`_buildGraph: ${error}`);
		}
	}

	getFiles (fileSpec) {
		const parent = this.recordList.get(fileSpec);
		const leaves = [];
		if (parent) {
			for (const record of parent.getAdjacents()) {
				record.getExtension() && leaves.push(record);
			}
		}
		return leaves;
	}

	getDirectories (fileSpec) {
		const parent = this.recordList.get(fileSpec);
		const nodes = [];
		if (parent) {
			for (const record of parent.getAdjacents()) {
				!record.getExtension() && nodes.push(record);
			}
		}
		return nodes;
	}

	getFile (fileSpec) {
		return this.recordList.get(fileSpec);
	}

	*search (fileSpec) {
		const visited = new Map();
		const visitList = new Stack();

		visitList.add(this.getFile(fileSpec));

		while (!visitList.isEmpty()) {
			const node = visitList.remove();
			if (node && !visited.has(node)) {
				yield node;
				visited.set(node);
				node.getAdjacents().forEach(adj => visitList.add(adj));
			}
		}
	}

	print () {
		Array.from(this.recordList.values()).forEach(node => node.print());
	}
}

module.exports = FileTree;
