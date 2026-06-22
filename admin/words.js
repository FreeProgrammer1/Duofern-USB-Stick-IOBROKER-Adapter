/*global systemDictionary:true */
'use strict';

const allLanguages = (en, de) => ({
    en,
    de,
    ru: en,
    pt: en,
    nl: en,
    fr: en,
    it: en,
    es: en,
    pl: en,
    uk: en,
    'zh-cn': en
});

systemDictionary = {
    "DuoFern Stick settings": allLanguages("DuoFern Stick settings", "DuoFern Stick Einstellungen"),
    "Configure the local Rademacher DuoFern USB stick. Standard baud rate is 115200.": allLanguages("Configure the local Rademacher DuoFern USB stick. Standard baud rate is 115200.", "Konfiguration des lokalen Rademacher DuoFern USB-Sticks. Standard-Baudrate ist 115200."),
    "Serial port": allLanguages("Serial port", "Serieller Port"),
    "Baud rate": allLanguages("Baud rate", "Baudrate"),
    "Dongle serial": allLanguages("Dongle serial", "Dongle-Seriennummer"),
    "Must usually start with 6F.": allLanguages("Must usually start with 6F.", "Muss normalerweise mit 6F beginnen."),
    "Automatically create devices": allLanguages("Automatically create devices", "Geräte automatisch anlegen"),
    "Request status on adapter start": allLanguages("Request status on adapter start", "Status beim Adapterstart abfragen"),
    "Preserve values when telegrams are incomplete": allLanguages("Preserve values when telegrams are incomplete", "Werte bei unvollständigen Telegrammen beibehalten"),
    "Create only supported/observed states per device": allLanguages("Create only supported/observed states per device", "Nur unterstützte/erkannte States je Gerät anlegen"),
    "Log raw telegrams": allLanguages("Log raw telegrams", "Rohtelegramme protokollieren")
};
