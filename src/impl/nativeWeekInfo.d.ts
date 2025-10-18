declare namespace Intl {
  declare interface WeekInfo {
    firstDay: number;
    weekend: number[];
  }

  declare interface Locale {
    getWeekInfo(): WeekInfo;
    get weekInfo(): WeekInfo;
  }
}
