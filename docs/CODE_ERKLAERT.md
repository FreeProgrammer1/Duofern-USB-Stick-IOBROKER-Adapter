# Technische Dokumentation

Diese Dokumentation beschreibt den Aufbau des Adapters und die wichtigsten Datenflüsse. Die Beschreibung ist bewusst modulorientiert aufgebaut, damit Wartung, Fehlersuche und spätere Erweiterungen nachvollziehbar bleiben. Der Sourcecode ist deshalb nicht mehr zeilenweise kommentiert, sondern nutzt kurze Modul- und Abschnittskommentare für die fachlich wichtigen Stellen.

## Architektur

Der Adapter besteht im Kern aus zwei Bereichen:

1. **Laufzeitadapter (`main.js`)**
   - startet den ioBroker-Adapter
   - lädt die Konfiguration
   - öffnet die serielle Schnittstelle zum USB-Stick
   - verarbeitet eingehende Daten
   - legt ioBroker-Objekte und States an
   - reagiert auf State-Änderungen aus ioBroker
   - sendet Steuerbefehle über eine Warteschlange
   - fragt nach relevanten Befehlen gezielt Statuswerte ab

2. **Protokollmodul (`lib/protocol.js`)**
   - enthält Telegrammvorlagen und Befehlsfunktionen
   - normalisiert und prüft Hexwerte
   - erkennt Gerätecodes aus Telegrammen
   - ordnet Gerätecode-Präfixe passenden Geräteprofilen zu
   - dekodiert Statuswerte in lesbare State-Namen
   - stellt sicher, dass nur profilpassende Werte verarbeitet werden

## Startablauf

Beim Start führt der Adapter folgende Schritte aus:

1. ioBroker-Konfiguration lesen.
2. Basisobjekte und globale States anlegen.
3. Bekannte Gerätecodes aus der Konfiguration normalisieren.
4. Geräteobjekte und passende Profil-States anlegen.
5. Serielle Verbindung mit der konfigurierten Baudrate öffnen.
6. USB-Stick initialisieren.
7. Empfangsverarbeitung und Sendewarteschlange aktivieren.
8. Optional bekannte Geräte initial abfragen.

## Empfangsverarbeitung

Eingehende Bytes werden gesammelt und in vollständige Telegramme zerlegt. Jedes vollständige Telegramm wird anschließend:

1. als Rohtelegramm in Diagnose-States geschrieben,
2. bestätigt, sofern ein ACK erforderlich ist,
3. auf Gerätecode und Telegrammtyp geprüft,
4. einem bekannten oder neu erkannten Gerät zugeordnet,
5. mit dem passenden Geräteprofil dekodiert,
6. nur dann in ioBroker-States geschrieben, wenn der Wert zum Profil passt.

Dieser Ablauf verhindert, dass Telegramme von Fernbedienungen, Sensoren oder unvollständige Antworten gültige Aktorwerte überschreiben.

## Sendelogik

Schreibbare ioBroker-States werden in Protokollbefehle übersetzt. Die Befehle laufen über eine Sendewarteschlange, damit Telegramme nacheinander und reproduzierbar übertragen werden.

Typische Beispiele:

- `position` erzeugt einen Positionsbefehl.
- `up`, `down` und `stop` erzeugen Bewegungsbefehle.
- `on`, `off` und `level` steuern Schalt- oder Dimmaktoren.
- `slatPosition` steuert Lamellenwerte bei passenden Jalousie-Aktoren.
- `getStatus` löst eine gezielte Statusabfrage aus.

Nach Status-relevanten Steuerbefehlen kann der Adapter eine Statusabfrage auslösen, damit ioBroker wieder den tatsächlichen Geräte-Istwert erhält.

## Geräteprofile

Geräteprofile steuern, welche States ein Gerät erhält und welche Statuswerte übernommen werden dürfen.

Beispiele:

- Rollladen-/Rohrmotorprofile erhalten Bewegungs- und Positionsstates.
- Jalousie-/Lamellenprofile erhalten zusätzlich Lamellenstates.
- Schaltaktoren erhalten Schaltstates.
- Dimmer erhalten Levelstates.
- Sensoren, Fernbedienungen und Wandtaster erhalten keine falschen Aktor-Steuerstates.

Neue Geräte sollten bevorzugt durch Ergänzung des passenden Geräteprofils erweitert werden, nicht durch pauschales Anlegen aller bekannten States.

## Statuswert-Schutz

Der Adapter übernimmt Statuswerte nur aus passenden und plausiblen Telegrammen. Dadurch werden folgende Fehler vermieden:

- Positionswerte springen nicht durch fremde Telegramme auf `0`.
- Laufzeitwerte bleiben erhalten, bis ein neues passendes Status-Telegramm eintrifft.
- Sensor- oder Tastertelegramme verändern keine Aktor-Istwerte direkt.
- Profilfremde Werte werden ignoriert statt blind geschrieben.

## Passive Discovery

Der Adapter kann Telegramme aus der Umgebung mitlesen, solange der USB-Stick sie empfängt. Dadurch können Geräte erkannt werden, wenn sie aktiv senden. Es handelt sich nicht um einen aktiven Scan aller Geräte in Reichweite.

Relevante Diagnose-States sind:

- `info.rawRx`
- `info.lastParsed`
- `info.lastDeviceCode`
- `info.unparsedRxCount`

## Wartungsregeln

Für weitere Änderungen sollte die bestehende Struktur beibehalten werden:

1. Serielle Verbindung und Sendelogik nur ändern, wenn ein konkreter Fehler dort nachgewiesen ist.
2. Neue Geräte zuerst als Profil im Protokollmodul ergänzen.
3. ioBroker-States nur profilbezogen anlegen.
4. Empfangene Werte nur übernehmen, wenn Telegrammtyp und Geräteprofil passen.
5. Nach jeder Änderung `npm run check` und `npm test` ausführen.
