<script lang="ts">
  import {
    Motion,
    useTransform,
    MotionValue,
    motionValue,
  } from "svelte-motion";
  import Lid from "./Lid.svelte";
  import Keypad from "./Keypad.svelte";
  import { onMount } from "svelte";
  import { ScrollTopValue } from "$lib";
  import { P } from "flowbite-svelte";
  export let src: string | undefined = undefined;
  export let showGradient: boolean | undefined = undefined;

  let ref: HTMLDivElement;
  // let triggerPoint = 0;
  // let endPoint = 0;
  let isMobile = false;
  // let buffer = 600;

  // your 0→1 progress MotionValue
  //   const scrollProgress: MotionValue<number> = motionValue(0);
  const scrollYProgress: MotionValue<number> = motionValue(0);
  onMount(() => {
    // 1) measure
    if (window && window.innerWidth < 768) {
      isMobile = true;
    }
    // 2) now subscribe, so triggerPoint/endPoint are set
    let lastProgress = 0;
    const unsubscribe = ScrollTopValue.subscribe(({ top, height }) => {
      let raw: number;
      const rect = ref.getBoundingClientRect();
      // calculate the trigger point
      // when bottom of container is buffer px above the element

      const triggerPoint = height - top - rect.height * 1.5;
      //   const triggerPoint =
      //     rect.top - (window.innerHeight + rect.height / 2) * -1;
      // end when scrollTop passes the element’s height past trigger
      const endPoint = triggerPoint + ref.offsetHeight;

      if (top < triggerPoint) raw = 0;
      else if (top >= endPoint) raw = 1;
      else raw = (top - triggerPoint) / (endPoint - triggerPoint);

      // clamp into [0,1]
      raw = Math.min(Math.max(raw, 0), 1);

      if (raw !== lastProgress) {
        scrollYProgress.set(raw);
        lastProgress = raw;
      }
    });

    return unsubscribe;
  });

  const scaleX = useTransform(
    scrollYProgress,
    [0, 0.3],
    [1.2, isMobile ? 1 : 1.5],
  );
  const scaleY = useTransform(
    scrollYProgress,
    [0, 0.3],
    [0.3, isMobile ? 1 : 1.5],
  );

  const translate = useTransform(scrollYProgress, [0, 1], [-80, 1500]);
  const rotate = useTransform(scrollYProgress, [0.1, 0.12, 0.3], [-28, -28, 0]);
  const textTransform = useTransform(scrollYProgress, [0, 0.3], [0, 100]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
</script>

<div
  bind:this={ref}
  class="flex min-h-[60vh] min-w-[42rem] flex-shrink-0 scale-[0.35] transform flex-col items-center justify-start py-0 [perspective:800px] sm:scale-50 md:scale-100 md:pb-60 md:pt-28"
>
  <Motion
    let:motion
    style={{
      translateY: textTransform,
      opacity: textOpacity,
    }}
  >
    <h2 use:motion class="mb-2 text-center text-3xl font-bold">
      <slot name="title">
        <span> Built with love, by Similie </span>
      </slot>
    </h2>
    <div class="mb-8">
      <slot name="description">
        <P class="mb-4">Mapping comes alive with with over 100 parameters</P>
      </slot>
    </div>
  </Motion>
  <Lid {src} {scaleX} {scaleY} {rotate} {translate} />
  <!-- Base Area -->
  <div
    class="relative -z-10 h-[22rem] w-[32rem] overflow-hidden rounded-2xl bg-gray-200 dark:bg-[#272729]"
  >
    <!-- above keyboard bar -->
    <div class="relative h-10 w-full">
      <div class="absolute inset-x-0 mx-auto h-4 w-[80%] bg-[#050505]"></div>
    </div>
    <div class="relative flex">
      <div class="mx-auto h-full w-[10%] overflow-hidden">
        <div
          class="mt-2 flex h-40 gap-[2px] px-[0.5px]"
          style="background-image: radial-gradient(circle, #08080A 0.5px, transparent 0.5px); background-size: 3px 3px;"
        ></div>
      </div>
      <div class="mx-auto h-full w-[80%]">
        <Keypad />
      </div>
      <div class="mx-auto h-full w-[10%] overflow-hidden">
        <div
          class="mt-2 flex h-40 gap-[2px] px-[0.5px]"
          style="background-image: radial-gradient(circle, #08080A 0.5px, transparent 0.5px); background-size: 3px 3px;"
        ></div>
      </div>
    </div>
    <div
      class="mx-auto my-1 h-32 w-[40%] rounded-xl"
      style="box-shadow: 0px 0px 1px 1px #00000020 inset;"
    ></div>
    <div
      class="absolute inset-x-0 bottom-0 mx-auto h-2 w-20 rounded-tl-3xl rounded-tr-3xl bg-gradient-to-t from-[#272729] to-[#050505]"
    ></div>
    {#if showGradient}
      <div
        class="absolute inset-x-0 bottom-0 z-50 h-40 w-full bg-gradient-to-t from-white via-white to-transparent dark:from-black dark:via-black"
      ></div>
    {/if}

    <div class="absolute bottom-4 left-4">
      <slot name="badge" />
    </div>
  </div>
</div>
