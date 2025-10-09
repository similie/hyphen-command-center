<script lang="ts">
  import { Heading, P, Button } from "flowbite-svelte";
  import {
    _t,
    addNavbarCrumb,
    removeNavbarCrumb,
    type CrumbHeading,
  } from "$lib";
  import BodyContainer from "$layouts/BodyContainer.svelte";
  import { onDestroy, onMount } from "svelte";
  const headings: CrumbHeading[] = [
    //{ title: $_t("Courses"), href: "/courses" },
    { title: "About" },
  ];
  onMount(() => {
    addNavbarCrumb(headings);
  });

  onDestroy(() => {
    removeNavbarCrumb(headings.map((h) => h.title));
  });
</script>

<BodyContainer>
  <!-- Hero / Intro -->
  <div class="space-y-16">
    <section class=" space-y-6">
      <Heading tag="h1" class="text-primary-600 dark:text-primary-600 font-bold"
        >{$_t("About Similie")}</Heading
      >
      <P class="text-lg">
        {$_t(
          "Similie is a climate technology company driven by one mission: to build open, accessible, and impactful technological solutions that make communities safer, more resilient, and better prepared for the challenges of a changing planet",
        )}.
      </P>
    </section>

    <!-- Our Story -->
    <section class="grid md:grid-cols-2 gap-12 items-start">
      <div class="space-y-4 mt-6">
        <Heading
          tag="h2"
          class="font-semibold text-primary-600 dark:text-primary-600"
        >
          {$_t("Building for Global Impact")}
        </Heading>
        <P class=" leading-relaxed">
          {$_t(
            "From our beginnings in Timor-Leste, we have always believed that technology should be open, collaborative, and designed for the people who need it most. Our work in climate technologies—spanning early warning systems, IoT-powered monitoring, and data-driven insights—helps communities not only adapt, but thrive in the face of climate challenges",
          )}.
        </P>
        <P class=" leading-relaxed">
          {$_t(
            "By creating solutions that are shared, scalable, and open to the world, Similie is proving that innovation from a small nation can ripple outward, inspiring and protecting lives across the globe",
          )}.
        </P>
      </div>
      <div>
        <img
          src="/hyphen.jpg"
          alt="Similie Climate Technology"
          class="rounded-2xl shadow-lg"
        />
      </div>
    </section>

    <!-- Transition to Academy -->
    <section class="grid md:grid-cols-2 gap-12 items-center">
      <div>
        <img
          src="/academy-site.jpg"
          alt="Similie Academy Students"
          class="rounded-2xl shadow-lg"
        />
      </div>
      <div class="space-y-4">
        <Heading
          tag="h2"
          class="font-semibold text-primary-600 dark:text-primary-600"
          >{$_t("Why We Built the Academy")}</Heading
        >
        <P class=" leading-relaxed">
          {$_t(
            "Our journey with technology has shown us a powerful truth: the shortest path to Timor-Leste’s growth is through education. While our climate technologies protect communities today, we know that the real transformation comes when young people are empowered to create, code, design, and innovate for tomorrow",
          )}.
        </P>
        <P class=" leading-relaxed">
          {$_t(
            "Technology opens doors to the most profitable and globally connected industry in the world. By equipping Timorese youth with future-ready skills, the Academy ensures that opportunity isn’t limited by borders. Instead, it enables the people of Timor-Leste to step into the world as creators, entrepreneurs, and leaders in the digital age",
          )}.
        </P>
      </div>
    </section>

    <!-- Call to Action -->
    <section class="text-center py-12 bg-primary-600 rounded-2xl space-y-6">
      <Heading tag="h2" class="font-bold text-white dark:text-white"
        >{$_t("Make Impossible, Possible")}</Heading
      >
      <P
        class="max-w-2xl mx-auto text-lg text-center text-white dark:text-white"
      >
        {$_t(
          "Through open technology and transformative education, Similie aims to create a brighter, more resilient future for Timor-Leste—and for the world",
        )}.
      </P>
      <Button href="/courses/public" color="light" size="xl" class="mt-4">
        {$_t("Explore Our Courses")}
      </Button>
    </section>
  </div>
</BodyContainer>
