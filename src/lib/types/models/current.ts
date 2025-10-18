// export type DevicePayload = any;
// export type IPv4 = `${number}.${number}.${number}.${number}`;

// export type DevicePayloadMessage = {
//   device: string;
//   target: number;
//   date: Date;
//   payload: DevicePayload;
// };

// export type DeviceHeartbeatMessage = {
//   device: string;
//   date: Date | number;
//   network:
//     | {
//         ssid: string;
//         bssid: string;
//         rssi: number;
//         channel: number;
//         encryp: number;
//         l_ip: IPv4;
//         g_ip: IPv4;
//         mask: IPv4;
//         dns1: IPv4;
//         dns2: IPv4;
//       }
//     | {};
//   cell:
//     | {
//         IMEI: string;
//         IMSI: string;
//         l_ip: IPv4;
//         op: string;
//         prov: string;
//         n_mode: number;
//         sig_q: number;
//         ccid: string;
//       }
//     | {};
//   sys: { free: number; mem: number; up: string; v: string };
// };
