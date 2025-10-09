<script lang="ts">
  import { Img } from "flowbite-svelte";
  import { GradientBackground } from ".";
  import { GithubSolid } from "flowbite-svelte-icons";
  export let imageSrc: string;
  export let imageAlt: string;
  export let title: string;
  export let description: string;
  export let link: string;
  export let linkText: string;
</script>

<div>
  <GradientBackground className="rounded-lg bg-white dark:bg-zinc-900 ">
    <Img
      src={imageSrc}
      height="400"
      width="400"
      alt={imageAlt}
      class="object-cover w-full rounded-t-lg h-64"
    />
    <div class="w-full flex-col p-4 sm:p-8">
      <p
        class="mb-2 mt-4 text-base text-black dark:text-neutral-200 sm:text-xl"
      >
        {title}
      </p>

      <p class="text-sm text-neutral-600 dark:text-neutral-400">
        {description}
      </p>
      <a
        href={link}
        target="_blank"
        class="mt-4 flex items-center space-x-1 rounded-full bg-black py-1 pl-4 pr-1 text-xs font-bold text-white text-center dark:bg-zinc-800 mb-4"
        type="button"
      >
        <GithubSolid />&nbsp; {linkText}
      </a>
    </div>
  </GradientBackground>
</div>
