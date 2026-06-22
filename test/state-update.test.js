'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

assert.ok(fs.existsSync('io-package.json'), 'io-package.json must exist');
assert.ok(fs.existsSync('package.json'), 'package.json must exist');
assert.ok(fs.existsSync('main.js'), 'main.js must exist');

const pkg = require('../package.json');
const ioPackage = require('../io-package.json');

assert.equal(pkg.name, 'iobroker.duofernstick');
assert.equal(ioPackage.common.name, 'duofernstick');
assert.equal(pkg.version, ioPackage.common.version);
assert.ok(pkg.engines.node.includes('>=22'));
assert.ok(ioPackage.common.tier >= 1 && ioPackage.common.tier <= 3);
assert.ok(ioPackage.common.news[pkg.version]);
assert.ok(ioPackage.common.licenseInformation);

console.log('Basic adapter package checks passed.');
