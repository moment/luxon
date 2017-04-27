import { LocalZone } from './zones/localZone';

/**
 * Global settings
 */
export class Settings {}

/**
 * Callback for returning the current timestamp.
 */
Settings.now = () => new Date().valueOf();

/**
 * The default time zone to create DateTimes in.
 */
Settings.defaultZone = LocalZone.instance;
