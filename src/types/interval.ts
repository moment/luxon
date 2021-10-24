import Invalid from "../impl/invalid";
import DateTime from "../datetime";

export interface Config {
  end?: DateTime | null;
  invalid?: Invalid;
  start?: DateTime | null;
}

export interface IntervalObject {
  start?: DateTime;
  end?: DateTime;
}
