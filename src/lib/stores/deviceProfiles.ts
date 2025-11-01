import type { IDevice, IDeviceProfile } from "$lib/api";
import { writable } from "svelte/store";

export const DeviceProfileStore = writable<IDeviceProfile[]>([]);

const pullDeviceProfilesFromStore = () => {
  return new Promise<IDeviceProfile[]>((resolve) => {
    const unsubscribe = DeviceProfileStore.subscribe((profiles) => {
      return resolve(profiles);
    });
    unsubscribe();
  });
};

export const findDeviceProfileByDevice = async (device: IDevice) => {
  const profiles = await pullDeviceProfilesFromStore();
  return profiles.find((profile) => profile.id === device.profile);
};

export const profileExpireTime = async (device: IDevice) => {
  const profile = await findDeviceProfileByDevice(device);
  if (!profile) {
    return 15;
  }
  return profile.offline || 15;
};
