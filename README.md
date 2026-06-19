# ioBroker Adapter: DuoFern Stick

This adapter connects the **Rademacher DuoFern USB Stick** to ioBroker.

It is intended for local DuoFern installations where devices should be detected, monitored, and controlled directly through the USB stick without a cloud service.

## Features

- Serial connection to the Rademacher DuoFern USB Stick
- Configuration of serial port, baud rate, and dongle serial in the ioBroker Admin UI
- Reception and parsing of DuoFern telegrams
- Automatic creation of detected DuoFern devices below `devices.*`
- Device type catalogue for many DuoFern device classes
- Persistent state handling for incomplete telegrams
- Device states for position, movement, direction, running time, automatic modes, and raw telegrams
- Control states for pairing, unpairing, status broadcast, and raw telegram transmission
- Optional raw telegram logging for debugging

## Supported device classes

The adapter contains a device and capability catalogue for several DuoFern classes, including:

| Device class | Examples |
| --- | --- |
| Roller shutters and belt winders | RolloTron Standard, RolloTron Comfort |
| Tubular motors | Tubular motor, tubular motor actuator, tubular motor controller |
| Venetian blinds | Troll devices and blind-related actuators |
| Actuators | Universal actuator, socket actuator, switching actuators |
| Dimmers | DuoFern dimming actuators and dimmers |
| Sensors | Sun sensor, wind sensor, environmental sensor, motion detector, smoke detector, window or door contact |
| Remotes and transmitters | Handheld transmitters, wall buttons, timers, flush-mounted transmitters |
| Heating devices | Room thermostat and radiator actuator |
| Gate and special devices | SX5 and gate-related devices |

Only suitable or observed states are created for a detected device where possible. This avoids creating every theoretical datapoint for every device.

## Requirements

- ioBroker with js-controller 6.0.11 or newer
- Node.js 20 or newer
- ioBroker Admin 7.6.17 or newer
- Rademacher DuoFern USB Stick
- Access to the serial device of the USB stick

On Linux, the ioBroker process must have permission to access the serial device. Typical device paths are:

```text
/dev/ttyUSB0
/dev/serial/by-id/usb-Rademacher_DuoFern_USB-Stick-if00-port0
```

The stable path below `/dev/serial/by-id/` is recommended because it usually remains unchanged after reconnecting the stick or restarting the host.

## Installation

Install the adapter through the ioBroker Admin interface.

Recommended ways:

1. Open **ioBroker Admin**.
2. Open **Adapters**.
3. Use the GitHub or custom installation option.
4. Enter the GitHub repository URL or the release asset URL for the `.tgz` package.
5. Create an instance of `duofernstick`.
6. Open the instance configuration and enter the correct serial port.
7. Start the adapter and check `duofernstick.0.info.connection`.

Direct package-manager commands are intentionally not documented here because ioBroker adapters should be installed through the ioBroker Admin or ioBroker adapter installation workflow.

## Configuration

The most important settings are available in the instance configuration.

| Setting | Description |
| --- | --- |
| `serialPort` | Serial port of the DuoFern USB Stick |
| `baudRate` | Baud rate, default: `115200` |
| `dongleSerial` | Serial number of the DuoFern stick, usually starting with `6F` |
| `autoCreateDevices` | Automatically create detected devices |
| `statusOnStart` | Request device status when the adapter starts |
| `preserveUnknownValues` | Keep existing values when a telegram is incomplete |
| `createOnlySupportedStates` | Create only supported or observed states per device |
| `debugRaw` | Log raw telegrams for debugging |

## Object structure

After startup, the adapter creates the following main object structure:

```text
duofernstick.0
├── info
│   ├── connection
│   ├── lastRawTelegram
│   └── lastError
├── control
│   ├── pair
│   ├── unpair
│   ├── statusBroadcast
│   └── raw
└── devices
    └── <deviceId>
        ├── serial
        ├── deviceType
        ├── deviceTypeName
        ├── lastSeen
        ├── rawTelegram
        ├── command
        ├── getStatus
        ├── up
        ├── down
        ├── stop
        ├── position
        └── ...
```

The exact number of states depends on the detected device type and on observed telegrams.

## Central control states

### Start pairing

```text
duofernstick.0.control.pair = true
```

Starts pairing mode.

### Start unpairing

```text
duofernstick.0.control.unpair = true
```

Starts unpairing mode.

### Request status broadcast

```text
duofernstick.0.control.statusBroadcast = true
```

Requests a status update from known or reachable devices.

### Send a raw telegram

```text
duofernstick.0.control.raw = <HEX_TELEGRAM>
```

Sends a raw hexadecimal telegram through the stick. This is mainly intended for testing and debugging.

## Device control states

Depending on the device type, the following states may be available:

| State | Meaning |
| --- | --- |
| `up` | Move blind or shutter up |
| `down` | Move blind or shutter down |
| `stop` | Stop the current movement |
| `toggle` | Toggle command |
| `position` | Target position in percent |
| `getStatus` | Request status from this device |
| `manualMode` | Manual mode |
| `timeAutomatic` | Time automatic mode |
| `sunAutomatic` | Sun automatic mode |
| `duskAutomatic` | Dusk automatic mode |
| `dawnAutomatic` | Dawn automatic mode |
| `windAutomatic` | Wind automatic mode |
| `rainAutomatic` | Rain automatic mode |
| `level` | Dimming or level value |
| `state` | Switching state |

## Status states

Typical status states are:

| State | Description |
| --- | --- |
| `position` | Current position in percent |
| `moving` | Device is moving |
| `direction` | Movement direction such as `up`, `down`, `stop`, or `unknown` |
| `runningTime` | Running time in seconds |
| `lastSeen` | Timestamp of the last received telegram |
| `rawTelegram` | Last telegram received from this device |
| `deviceType` | DuoFern device type code |
| `deviceTypeName` | Detected device name |

Incoming telegrams are handled as partial updates. If a telegram does not contain a certain value, an already existing ioBroker state is not reset automatically.

## Troubleshooting

### The adapter does not connect to the USB stick

Check the following points:

- The configured serial port exists.
- The ioBroker process has permission to access the serial device.
- The USB stick is connected to the correct host or virtual machine.
- No other process is blocking the serial port.
- The configured baud rate is correct.

Useful Linux commands:

```text
ls -l /dev/ttyUSB*
ls -l /dev/serial/by-id/
```

### Devices are not created

Check the following points:

- The adapter is connected to the stick.
- `autoCreateDevices` is enabled.
- A DuoFern device sends a telegram or is paired.
- Raw telegram logging can be enabled temporarily for debugging.

### State values are incomplete

DuoFern telegrams may contain only partial device information. The adapter preserves existing values when a telegram does not contain a new value for a specific state.

## Development

The adapter source contains the main adapter runtime in `main.js` and protocol-related helper modules below `lib/`.

Useful local checks:

```text
node --check main.js
node --check lib/duofern-parser.js
node --check lib/state-manager.js
node --check lib/device-types.js
node --check lib/commands.js
```

## Changelog

### 0.1.21

- Added serial communication structure for the DuoFern USB Stick
- Added parser and frame extraction logic
- Added persistent state update handling
- Added automatic device creation
- Added central control states
- Added support catalogue for multiple DuoFern device classes
- Added Admin UI configuration

## License

MIT License

Copyright (c) 2026 FreeProgrammer1
