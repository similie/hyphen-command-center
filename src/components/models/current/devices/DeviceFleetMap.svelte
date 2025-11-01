<script lang="ts">
  import {
    type DeviceContentItems,
    DeviceModel,
    type IDevice,
    _t,
    copyToClipboard,
  } from "$lib";
  import type { UUID } from "crypto";
  import type { Map as MapLibreMap } from "maplibre-gl";
  import { onMount } from "svelte";
  import { MapLibre, Popup } from "svelte-maplibre";
  import DeviceStatus from "./DeviceStatus.svelte";
  import { BatteryIndicator, DateFormat, Toast, UserAvatar } from "$components";
  import { A, Hr, P, Spinner } from "flowbite-svelte";
  import { SimilieMarker } from "./map";

  type DeviceMarker = {
    lngLat: [number, number];
    label: string;
    name: string;
    id: UUID;
    device: IDevice;
  };

  const api = new DeviceModel();
  let zoom = $state<number>(2);
  let mapRef = $state<MapLibreMap | undefined>();
  let contentMap = $state<Record<UUID, DeviceContentItems>>({});
  const markers = $state<Array<DeviceMarker>>([]);

  const pullDevices = async () => {
    try {
      console.log("Fetching devices for map markers");
      await api
        .stream({})
        .eachBatch(30, async (devices: IDevice[]) => {
          const localMarkers: DeviceMarker[] = [];
          for (const device of devices) {
            if (device?.lat && device?.lng) {
              localMarkers.push({
                lngLat: [device.lng, device.lat],
                label: device.identity,
                name: device.name,
                id: device.id as UUID,
                device,
              });
            }
          }
          markers.push(...localMarkers);
        })
        .fetch();
    } catch (e) {
      console.error("Error fetching devices for map markers", e);
    }
  };

  onMount(pullDevices);

  function fitMapToMarkers(map: MapLibreMap, markerCoords: [number, number][]) {
    if (!map || markerCoords.length === 0) return;

    if (markerCoords.length === 1) {
      const [lng, lat] = markerCoords[0];
      map.setCenter([lng, lat]);
      map.setZoom(12);
      return;
    }

    let minLng = Infinity,
      minLat = Infinity,
      maxLng = -Infinity,
      maxLat = -Infinity;

    for (const [lng, lat] of markerCoords) {
      if (lng < minLng) minLng = lng;
      if (lat < minLat) minLat = lat;
      if (lng > maxLng) maxLng = lng;
      if (lat > maxLat) maxLat = lat;
    }

    const bounds: [[number, number], [number, number]] = [
      [minLng, minLat],
      [maxLng, maxLat],
    ];

    map.fitBounds(bounds, {
      padding: { top: 40, bottom: 40, left: 40, right: 40 },
    });
  }

  // Run after markers update
  $effect(() => {
    const map = mapRef!;
    const coords = markers.map((m) => m.lngLat);
    if (map && coords.length > 0) {
      fitMapToMarkers(map, coords);
    }
  });

  const onOpen = async (device: IDevice) => {
    if (contentMap[device.id as UUID]) {
      return;
    }

    try {
      const details = await api.deviceDetails(device);
      console.log("Fetched device details for popup:", details);
      if (!details) {
        return;
      }
      contentMap[device.id as UUID] = details;
    } catch (e) {
      console.error("Error fetching device details for popup", e);
      return;
    }

    console.log("Popup opened for device:", device);
  };
</script>

<div class="relative w-full h-full">
  <MapLibre
    {zoom}
    onload={(map) => {
      mapRef = map;
      console.log("Map loaded", mapRef);
    }}
    class="relative  h-full w-full sm:aspect-video sm:max-h-full  "
    attributionControl={false}
    style="https://cdn.similie.org/public/app/4shadow/similie-dark.json"
  >
    {#each markers as { lngLat, name, device }}
      <SimilieMarker {lngLat} {device}>
        <Popup
          onopen={() => onOpen(device)}
          popupClass={"rounded-2xl"}
          offset={[0, -10]}
        >
          <div class="flex flex-col space-y-4">
            {#if contentMap[device.id as UUID]}
              {@const details = contentMap[device.id as UUID]}
              <div class="flex flex-col text-gray-700">
                <div class="flex items-center space-x-2">
                  <DeviceStatus {device} />
                  <A class="space-x-2 " href={`/devices/${device.id}`}>
                    <P class="dark:text-gray-700">{name}</P>
                  </A>

                  {#if details.heartbeat && details.heartbeat.pow}
                    <BatteryIndicator
                      level={details.heartbeat.pow.bat}
                      width={8}
                    />
                  {/if}
                </div>
                <A
                  onclick={() => {
                    copyToClipboard(device.identity, () => {
                      Toast.success("Device identity copied to clipboard");
                    });
                  }}
                  class="text-sm "
                >
                  {device.identity}
                </A>

                {#if details.sensors && details.sensors.length}
                  <div class="flex flex-col space-y-2 mt-2">
                    {#each details.sensors as sensor}
                      <div class="flex space-x-2">
                        <UserAvatar
                          type="device"
                          size="xs"
                          avatar={sensor.avatar}
                        />
                        <span>{sensor.name}</span>
                      </div>
                    {/each}
                  </div>
                {/if}

                <Hr class="my-2" />
                {#if details.deviceType}
                  <div class="flex items-center space-x-2">
                    <UserAvatar
                      type="device"
                      size="xs"
                      avatar={details.deviceType.avatar}
                    />
                    <P class="dark:text-gray-600">{details.deviceType.name}</P>
                  </div>
                {/if}
                <div class="flex space-x-2">
                  <strong>{$_t("Last Heard")}:</strong>
                  {#if device.lastTouched}
                    <DateFormat stamp={device.lastTouched} />
                  {:else}
                    {$_t("Never")}
                  {/if}
                </div>
              </div>
            {:else}
              <P class="text-center dark:text-gray-700"
                >{$_t("Loading")} <Spinner /></P
              >
            {/if}
          </div>
        </Popup>
      </SimilieMarker>
      <!-- </Marker> -->
    {/each}
  </MapLibre>
</div>
