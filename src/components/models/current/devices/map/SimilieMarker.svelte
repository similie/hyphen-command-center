<script lang="ts">
  import { DeviceModel, type IDevice } from "$lib";
  import { onMount, type Snippet } from "svelte";
  import { Marker, type LngLatLike } from "svelte-maplibre";
  import DeviceAirtag from "@tabler/icons-svelte/icons/device-airtag";
  import MobiledataOff from "@tabler/icons-svelte/icons/mobiledata-off";
  import { profileExpireTime } from "$lib/stores/deviceProfiles";

  let {
    device,
    children,
    lngLat,
    draggable = false,
  } = $props<{
    device: IDevice;
    children: Snippet;
    lngLat: LngLatLike;
    draggable?: boolean;
  }>();
  let expireTime = $state<number>(15);
  let isOnline = $state(false);
  onMount(async () => {
    expireTime = await profileExpireTime(device);
    isOnline = DeviceModel.isOnline(device.lastTouched, expireTime);
  });
  $effect(() => {
    isOnline = DeviceModel.isOnline(device.lastTouched, expireTime);
  });
</script>

<Marker {lngLat} {draggable} offset={[0, -32]}>
  <svg width={65} height={65} viewBox="0 0 91 91">
    <g stroke={"#DDD"} fill={isOnline ? "white" : "#E74694"}>
      <path
        d="M42.9,52.2V91h5.3V52.2C60.9,50.9,70.8,40,70.8,27.1c0-13.9-11.4-25.3-25.3-25.3S20.2,13.2,20.2,27.1
         C20.2,40,30.2,50.8,42.9,52.2z"
      />
    </g>
    <circle fill="#FFFFFF" stroke={"#DDD"} cx="45.8" cy="26.8" r="21" />

    <!-- <g transform="translate(19 6)" scale={1.5}> -->
    <g
      transform={isOnline ? "translate(18, -0.5)" : "translate(28, 10)"}
      text-anchor="middle"
      dominant-baseline="middle"
      scale={1.5}
    >
      {#if isOnline}
        <DeviceAirtag color="#06c4de" size={55} />
      {:else}
        <MobiledataOff color="#E74694" size={35} />
      {/if}
    </g>
  </svg>
  {@render children()}
</Marker>
