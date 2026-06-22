"use strict";

const assert = require("assert");
const StateManager = require("../lib/state-manager");

class MockAdapter {
    constructor() {
        this.objects = {};
        this.states = {};
        this.log = { warn: () => {}, info: () => {}, debug: () => {}, error: () => {} };
    }
    async getAdapterObjectsAsync() { return this.objects; }
    async setObjectNotExistsAsync(id, obj) { if (!this.objects[id]) this.objects[id] = obj; }
    async getStateAsync(id) { return this.states[id]; }
    async setStateAsync(id, state) { this.states[id] = state; }
}

(async () => {
    const adapter = new MockAdapter();
    const sm = new StateManager(adapter);

    await sm.upsertFromTelegram({
        id: "123456",
        serial: "123456",
        deviceType: "42",
        deviceTypeName: "Rohrmotor-Aktor",
        raw: "AA",
        states: { position: 37, runningTime: 88, moving: true }
    });

    assert.strictEqual(adapter.states["devices.123456.position"].val, 37);
    assert.strictEqual(adapter.states["devices.123456.runningTime"].val, 88);

    await sm.upsertFromTelegram({
        id: "123456",
        serial: "123456",
        deviceType: "42",
        deviceTypeName: "Rohrmotor-Aktor",
        raw: "BB",
        states: { moving: false }
    });

    assert.strictEqual(adapter.states["devices.123456.position"].val, 37, "position must not be reset by missing field");
    assert.strictEqual(adapter.states["devices.123456.runningTime"].val, 88, "runningTime must not be reset by missing field");
    assert.strictEqual(adapter.states["devices.123456.moving"].val, false);

    await sm.upsertFromTelegram({
        id: "123456",
        serial: "123456",
        deviceType: "42",
        deviceTypeName: "Rohrmotor-Aktor",
        raw: "CC",
        states: { runningTime: 0 }
    });

    assert.strictEqual(adapter.states["devices.123456.runningTime"].val, 88, "runningTime=0 from partial frame must be ignored");


    const { DEVICE_TYPES, getDeviceType, getSupportedStates } = require("../lib/device-types");
    const expectedTypes = ["40","41","42","43","46","47","48","49","4A","4B","4C","4E","61","62","65","69","70","71","73","74","A0","A1","A2","A3","A4","A5","A7","A8","A9","AA","AB","AC","AD","AF","E0","E1"];
    for (const type of expectedTypes) {
        assert.ok(DEVICE_TYPES[type], `device type ${type} must exist`);
        assert.notStrictEqual(getDeviceType(type).category, "unknown", `device type ${type} must have a category`);
    }
    assert.ok(getSupportedStates("42").includes("slatPosition"), "Rohrmotor-Aktor must include slatPosition as venetian blind capability");
    assert.ok(getSupportedStates("4B").includes("slatPosition"), "Connect-Aktor must include slatPosition");
    assert.ok(getSupportedStates("4A").includes("level"), "Dimmer 4A must include level");
    assert.ok(getSupportedStates("74").includes("getStatus"), "Remote 74 must include getStatus");

    console.log("state-update.test.js passed");
})().catch(err => {
    console.error(err);
    process.exit(1);
});
