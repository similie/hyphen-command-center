<script lang="ts">
  import { siteConfig, type IDevice, _t, DeviceModel } from "$lib";
  import {
    Button,
    Card,
    Heading,
    Input,
    Modal,
    Skeleton,
  } from "flowbite-svelte";
  import {
    Control,
    ControlButton,
    FullscreenControl,
    GeolocateControl,
    MapLibre,
    NavigationControl,
    Popup,
    ScaleControl,
    BackgroundLayer,
  } from "svelte-maplibre";
  import { type Map } from "maplibre-gl";
  import { onMount } from "svelte";
  import { EditOutline, FloppyDiskOutline } from "flowbite-svelte-icons";
  import { InputFormItem } from "$components/input";
  import RequiredLabel from "$components/input/RequiredLabel.svelte";
  import { SimilieMarker } from "./map";
  let api = new DeviceModel();
  let mapRef = $state<Map | undefined>();
  let { device, editable = false } = $props<{
    device: IDevice;
    editable?: boolean;
  }>();
  let center = $state<[number, number]>([0, 0]);
  const markers: Array<{
    lngLat: [number, number];
    label: string;
    name: string;
  }> = $state([]);
  let openLatLngModal = $state(false);
  let validForm = $state(false);
  let formElement = $state<HTMLFormElement | null>(null);
  const setBounds = () => {
    if (!device.lat || !device.lng) {
      if (Object.keys($siteConfig.coordinates || {}).length === 2) {
        center = [+$siteConfig.coordinates!.lng, +$siteConfig.coordinates!.lat];
        return;
      }
    }
    center = [device.lng, device.lat];
    markers.push({
      lngLat: center,
      label: device.name,
      name: device.name,
    });
    mapRef?.flyTo({ center, zoom: 7 });
  };
  onMount(() => {
    setBounds();
  });

  const saveValues = async () => {
    try {
      await api.update({ id: device.id }, { lat: device.lat, lng: device.lng });
      openLatLngModal = false;
      validForm = false;
      markers.splice(0, markers.length);
      setBounds();
    } catch (e) {
      console.error("Error saving device location", e);
    }
  };
  const checkValidity = () => {
    if (!formElement) return;
    validForm = formElement.checkValidity();
  };
</script>

{#if editable}
  <Modal
    bind:open={openLatLngModal}
    size="xs"
    form={false}
    title={$_t("Set Device Location")}
    outsideclose={false}
  >
    <form bind:this={formElement} oninput={checkValidity} class="space-y-4">
      <div class="flex flex-col space-y-4 w-full">
        <InputFormItem>
          <RequiredLabel content="Latitude"></RequiredLabel>
          <Input
            type="number"
            bind:value={device.lat}
            placeholder="Latitude"
            step="any"
            required
          />
        </InputFormItem>

        <InputFormItem>
          <RequiredLabel content="Longitude"></RequiredLabel>
          <Input
            type="number"
            bind:value={device.lng}
            placeholder="Longitude"
            step="any"
            required
          />
        </InputFormItem>
      </div>
    </form>
    {#snippet footer()}
      <div class="flex w-full">
        <Button
          disabled={!validForm}
          class="ml-auto"
          onclick={saveValues}
          type="submit"><FloppyDiskOutline /> {$_t("Save")}</Button
        >
      </div>
    {/snippet}
  </Modal>
{/if}
<Card
  class="w-full dark:bg-gray-950 flex flex-col p-2 max-w-full overflow-hidden"
>
  <div class="relative w-full h-full">
    <MapLibre
      zoom={7}
      class="relative aspect-[9/16] max-h-[70vh] h-full w-full sm:aspect-video sm:max-h-full rounded-md "
      attributionControl={false}
      {center}
      style="https://cdn.similie.org/public/app/4shadow/similie-dark.json"
    >
      {#snippet children({ map })}
        {#if !markers.length}
          <BackgroundLayer
            paint={{ "background-color": "#06c4de", "background-opacity": 0.5 }}
          ></BackgroundLayer>
          <div
            class="absolute inset-0 flex flex-col items-center justify-center text-center bg-black/20 text-white px-4 top-0 left-0 z-30"
          >
            <Heading tag="h4">{$_t("No location set")}</Heading>
            <p class="text-sm opacity-90">
              {$_t("Please set the device location to view it on the map.")}
            </p>
            {#if editable}
              <Button
                color="light"
                class="mt-4"
                onclick={() => {
                  mapRef = map;
                  openLatLngModal = true;
                }}
              >
                {$_t("Set Location")}
              </Button>
            {/if}
          </div>
        {/if}
        <NavigationControl position="top-left" />
        <GeolocateControl
          position="top-left"
          fitBoundsOptions={{ maxZoom: 12 }}
        />
        <ScaleControl />
        <FullscreenControl position="bottom-right" />
        {#if editable}
          <Control class="flex flex-col gap-y-2">
            <ControlButton
              class="bg-white hover:bg-gray-300 p-2 text-center flex justify-center rounded-md text-gray-600 hover:text-gray-800"
              onclick={() => {
                mapRef = map;
                openLatLngModal = true;
              }}
            >
              <EditOutline />
            </ControlButton>
          </Control>
        {/if}

        {#each markers as { lngLat, name }}
          <SimilieMarker {lngLat} {device}>
            <Popup offset={[0, -10]}>
              <div class="text-lg font-bold dark:text-gray-600">{name}</div>
            </Popup>
          </SimilieMarker>
        {/each}
      {/snippet}
    </MapLibre>
  </div>
</Card>
