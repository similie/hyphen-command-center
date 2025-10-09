import { fileURLToPath } from "url";
import { dirname } from "path";
import {
  TimePeriod,
  DateHelper,
  timeConstants,
} from "@similie/shared-microservice-utils";
export const _dirname = dirname(fileURLToPath(import.meta.url));

export const greaterThanModelSearch = (time: number) => {
  return {
    gt: new Date(
      new DateHelper(timeConstants.now_).minus(time, TimePeriod.minutes).toISO,
    ),
  };
};

export const lessThanModelSearch = (time: number) => {
  return {
    lt: new Date(
      new DateHelper(timeConstants.now_).minus(time, TimePeriod.minutes).toISO,
    ),
  };
};

export const greaterThanEqualModelSearch = (time: number) => {
  return {
    gte: new Date(
      new DateHelper(timeConstants.now_).minus(time, TimePeriod.minutes).toISO,
    ),
  };
};

export const lessThanEqualModelSearch = (time: number) => {
  return {
    lte: new Date(
      new DateHelper(timeConstants.now_).minus(time, TimePeriod.minutes).toISO,
    ),
  };
};

export const minutesElapse = (readyDate: Date, minInterval: number) => {
  return new DateHelper(readyDate).isBefore(
    new DateHelper(timeConstants.now_).minus(minInterval, TimePeriod.minutes),
  );
};
