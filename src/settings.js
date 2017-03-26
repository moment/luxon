import { LocalZone } from './zones/localZone';

export class Settings {}
Settings.now = () => new Date().valueOf();
Settings.defaultZone = LocalZone.instance;
