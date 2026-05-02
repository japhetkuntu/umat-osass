#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const BSON = require('bson');

function exitWithHelp() {
  console.log('Usage: node inspect-mongo-dump.js /path/to/mongo-dump/LiveOsassDB');
  process.exit(1);
}

const dumpDir = process.argv[2];
if (!dumpDir) {
  exitWithHelp();
}

if (!fs.existsSync(dumpDir) || !fs.statSync(dumpDir).isDirectory()) {
  console.error(`Dump directory not found: ${dumpDir}`);
  process.exit(1);
}

const COLLECTION_SAMPLE_COUNT = 3;

function readDocumentsFromBson(filePath, sampleCount) {
  const docs = [];
  const fd = fs.openSync(filePath, 'r');
  try {
    const stats = fs.fstatSync(fd);
    let offset = 0;
    while (offset < stats.size && docs.length < sampleCount) {
      const header = Buffer.alloc(4);
      fs.readSync(fd, header, 0, 4, offset);
      const length = header.readInt32LE(0);
      if (length <= 0 || length > stats.size - offset) break;
      const raw = Buffer.alloc(length);
      fs.readSync(fd, raw, 0, length, offset);
      const doc = BSON.deserialize(raw);
      docs.push(doc);
      offset += length;
    }
  } finally {
    fs.closeSync(fd);
  }
  return docs;
}

const collections = fs.readdirSync(dumpDir).filter(file => file.endsWith('.bson')).map(file => path.basename(file, '.bson'));

if (collections.length === 0) {
  console.error('No .bson collections found in the provided directory.');
  process.exit(1);
}

console.log(`Found ${collections.length} collections in ${dumpDir}:`);
collections.forEach(name => console.log(`- ${name}`));
console.log('\nCollection samples:');

for (const collection of collections) {
  const bsonPath = path.join(dumpDir, `${collection}.bson`);
  const docs = readDocumentsFromBson(bsonPath, COLLECTION_SAMPLE_COUNT);
  console.log(`\n=== ${collection} (${docs.length} sample docs) ===`);
  docs.forEach((doc, index) => {
    console.log(`\n--- document ${index + 1} ---`);
    console.log(JSON.stringify(doc, null, 2));
  });
}
