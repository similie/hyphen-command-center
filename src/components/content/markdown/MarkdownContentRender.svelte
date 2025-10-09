<script lang="ts">
    import SvelteMarkdown from "svelte-markdown";
    import CodeRenderer from "./CodeRenderer.svelte";
    import HTMLRenderer from "./HTMLRenderer.svelte";
    import ARenderer from "./ARenderer.svelte";
    let { content } = $props<{ content: string }>();
    const options = {
        mangle: false, // disables obfuscation
        headerIds: false, // optional: disables auto-id on headers
    };
</script>

<SvelteMarkdown
    bind:source={content}
    {options}
    renderers={{ code: CodeRenderer, html: HTMLRenderer, link: ARenderer }}
/>
