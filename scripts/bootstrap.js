const luxon = require("../build/node/luxon");
global.DateTime = luxon.DateTime;
global.Duration = luxon.Duration;
global.Interval = luxon.Interval;
global.Settings = luxon.Settings;
global.Info = luxon.Info;
global.IANAZone = luxon.IANAZone;
