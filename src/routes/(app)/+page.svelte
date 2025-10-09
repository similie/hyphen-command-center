<script lang="ts">
  import { page } from "$app/state";
  import {
    Navbar,
    PageFooter,
    Spotlight,
    SpacesListedView,
  } from "$components";

  import BasicModelPage from "$layouts/BasicModelPage.svelte";
  import BodyContainer from "$layouts/BodyContainer.svelte";

  import {
    onDarkModeChange,
    isDarkMode,
    _t,
    siteUser,
    type SpacesModel,
    LocalSocket,
  } from "$lib";
  import {
    Button,
    Card,
    Carousel,
    CarouselIndicators,
    Controls,
    Gallery,
    Heading,
    Hr,
    P,
  } from "flowbite-svelte";
  import { onDestroy, onMount } from "svelte";
  import type { HTMLImgAttributes } from "svelte/elements";

  let backgroundFill = "#FFFFFF"; // Default background fill color

  const setBackgroundFill = () => {
    // Set the background fill color
    backgroundFill = isDarkMode() ? "#030712" : "#FFFFFF"; // Change this to your desired color

  };
  let dmFunction: (() => void) | undefined;

  // const firehose = (values: any) => {
  //     console.log("GOT THESE VALUES", values);
  // };

  onMount(async () => {
    dmFunction = await onDarkModeChange(() => {
      // Handle dark mode change
      setBackgroundFill();
    });


    // LocalSocket.instance.listen("firehose", firehose);
  });

  onDestroy(() => {
    dmFunction && dmFunction();
    // LocalSocket.instance.forget("firehose", firehose);
  });

  setBackgroundFill();
  let openDrawer = $state(true);
  // Example: dynamic models you’ll injec
  let image: HTMLImgAttributes | undefined = $state();

</script>



<BasicModelPage open={false} {openDrawer}>
  {#snippet header()}{/snippet}

  {#snippet body()}{/snippet}
  {#snippet headerContent()}
    <Navbar
      src="/favicon.png"
      darkSrc="/favicon.png"
      alt="Academy Logo"
      title=""
      width={30}
      >{#snippet createSection()}
          <!-- BOOMO -->
      {/snippet}
    </Navbar>
  {/snippet}
  {#snippet bodyContent()}
    <div class="w-full">
    </div>
  {/snippet}
</BasicModelPage>

<PageFooter />
