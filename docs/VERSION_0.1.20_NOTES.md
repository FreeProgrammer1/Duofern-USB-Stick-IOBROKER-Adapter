# Notizen zu Version 0.1.20

Diese Version ist gezielt auf den Fehler ausgelegt, dass Werte kurz korrekt angezeigt und danach auf `0` zurückgesetzt wurden.

## Technische Regel

Ein DuoFern-Status-Telegramm wird nicht als vollständiger Gerätestatus verstanden, sondern als Patch. Nur die Felder, die aus dem Telegramm wirklich sauber erkannt werden, werden in ioBroker geschrieben.

Dadurch bleiben Werte wie `position`, `runningTime`, Automatik-Modi usw. erhalten, bis das Gerät einen neuen plausiblen Wert sendet.

## Besonders geprüft

- `StateManager.upsertFromTelegram()` merged Werte nur.
- `shouldAcceptValue()` blockiert `runningTime = 0` aus Partialframes.
- `position` wird nur von 0 bis 100 akzeptiert.
- `getSupportedStates()` erstellt keine unnötigen States für jedes Gerät.
