'use strict';
const assert = require('assert');
const p = require('../lib/protocol');

assert.strictEqual(p.isHex44(p.constants.duoACK), true, 'ACK must be a valid 44 hex telegram');
assert.strictEqual(p.buildRemotePairStick('40ABCD'), '0D010601000000000000000000000000000040ABCD00');
assert.strictEqual(p.buildStatusRequest('406B2D'), '0DFF0F400000000000000000000000000000406B2D01');
assert.deepStrictEqual(p.parseDeviceCodes('406B2D, 4090AE 43ABCD01'), ['406B2D', '4090AE', '43ABCD01']);
assert.deepStrictEqual(p.parseDeviceCodes('define Rademacher DUOFERNSTICK /dev/ttyUSB0@115200 6F1A6F\ndefine WZ_Rollo DUOFERN 406B2D\ndefine Steckdose DUOFERN 43ABCD01'), ['406B2D', '43ABCD01']);

const up = p.buildDeviceCommand('406B2D', 'up')[0];
assert.strictEqual(up, '0D0107010000000000000000000000ZZZZZZ406B2D00', 'up command frame');

const position = p.buildDeviceCommand('406B2D', 'position', 42)[0];
assert.strictEqual(position, '0D010707002A000000000000000000ZZZZZZ406B2D00');
const positionProtocolInverse = p.buildDeviceCommand('406B2D', 'position', 42, { positionInverse: true })[0];
assert.strictEqual(positionProtocolInverse, '0D010707002A000000000000000000ZZZZZZ406B2D00', 'position command must stay identical to the raw position value');

const ackParsed = p.parseTelegram(p.constants.duoACK, '6FEDCB');
assert.strictEqual(ackParsed.isAck, true);

const extracted = p.extractDeviceCode('0FFF0F210000000000000025000000406B2DFFFFFF01', '6FEDCB');
assert.strictEqual(extracted, '406B2D');

console.log('protocol tests passed');

const statusWithGroup = '0FFF0F' + '210000000000000025000000' + '406B2D' + 'FFFFFF' + '01';
assert.strictEqual(statusWithGroup.length, 44, 'test status frame must have 44 hex digits');
const decodedStatus = p.decodeStatusTelegram(statusWithGroup, '406B2D', '01');
assert.strictEqual(decodedStatus.group, '21');
assert.strictEqual(decodedStatus.payloadStart, 6, '0FFF0F status frames must be decoded from the format byte at offset 6');
assert.strictEqual(decodedStatus.readings.position, 37, 'position must use the low bits of the 16-bit window starting at byte position 7');

const statusWithDeviceFormat23a = '0FFF0F' + '230000000000000040000000' + '47ABCD' + 'FFFFFF' + '01';
assert.strictEqual(statusWithDeviceFormat23a.length, 44, 'test 23A status frame must have 44 hex digits');
const decoded23a = p.decodeStatusTelegram(statusWithDeviceFormat23a, '47ABCD', '01');
assert.strictEqual(decoded23a.group, '23A', 'device-specific 23a format must be preferred for matching devices');
assert.strictEqual(decoded23a.payloadStart, 6, 'device-specific layouts must keep the same payload start');

// Device profile regression: every supported device-code prefix must resolve to a known profile.
for (const prefix of ['40','41','42','43','46','47','48','49','4A','4B','4C','4E','61','62','65','69','70','71','73','74','A0','A1','A2','A3','A4','A5','A7','A8','A9','AA','AB','AC','AD','AF','E0','E1']) {
    const code = `${prefix}ABCD`;
    assert.notStrictEqual(p.deviceClass(code), 'unknown', `device prefix ${prefix} must be recognized`);
}

assert.strictEqual(p.deviceCommandProfile('42ABCD').profile, 'venetianBlinds');
assert.strictEqual(p.commandSupportedByDevice('42ABCD', 'slatPosition'), true, 'Rohrmotor-Aktor 42 must expose slatPosition');
assert.strictEqual(p.commandSupportedByDevice('4BABCD', 'slatPosition'), true, 'Connect-Aktor 4B must expose slatPosition');
assert.strictEqual(p.commandSupportedByDevice('62ABCD', 'position'), true, 'device type 62 must behave like a blind/roller shutter');
assert.strictEqual(p.commandSupportedByDevice('65ABCD', 'position'), false, 'motion sensor 65 must not expose blind position control');
assert.strictEqual(p.commandSupportedByDevice('74ABCD', 'position'), false, 'wall remote 74 must not expose blind position control');
assert.strictEqual(p.commandSupportedByDevice('71ABCD', 'on'), true, 'Troll light/switch 71 must expose switch actor on control');
assert.strictEqual(p.commandSupportedByDevice('4AABCD', 'level'), true, 'Dimmer 4A must expose level control');

