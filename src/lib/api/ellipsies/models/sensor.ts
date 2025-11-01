import type { ISensor } from "../types";
import { HyphenModel } from "./base";

export class SensorModel extends HyphenModel<ISensor> {
  constructor() {
    super("sensors");
  }
}
