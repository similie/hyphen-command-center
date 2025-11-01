import { type IEntity, type UUID } from "@similie/model-connect-entities";

export enum SensorType {
  GENERIC = "generic",
  SDI_12 = "sdi-12",
  ANALOG = "analog",
  DIGITAL = "digital",
  I2C = "i2c",
  SPI = "spi",
  UART = "uart",
}

export const SensorTypeName: Record<SensorType, string> = {
  [SensorType.GENERIC]: "Generic",
  [SensorType.SDI_12]: "SDI-12",
  [SensorType.ANALOG]: "Analog",
  [SensorType.DIGITAL]: "Digital",
  [SensorType.I2C]: "I2C",
  [SensorType.SPI]: "SPI",
  [SensorType.UART]: "UART",
};

export interface ISensor extends IEntity {
  name: string;
  identity: string;
  description?: string;
  pins: string[];
  meta: Record<string, any>;
  max: number;
  sensorType: SensorType;
  avatar?: UUID;
}

export type ISensorWithKey = ISensor & { relation: { key: string } };
