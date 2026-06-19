"use strict";

const assert = require("node:assert/strict");
const StateManager = require("../lib/state-manager");

const adapterMock = {
    log: { warn: () => {} },
    getAdapterObjectsAsync: async () => ({}),
    setObjectNotExistsAsync: async () => {},
    getStateAsync: async () => null,
    setStateAsync: async () => {}
};

const manager = new StateManager(adapterMock);

assert.equal(manager.shouldAcceptValue("runningTime", 0), false);
assert.equal(manager.shouldAcceptValue("runningTime", 12), true);
assert.equal(manager.shouldAcceptValue("position", 50), true);
assert.equal(manager.shouldAcceptValue("position", 101), false);

console.log("state update test passed");
