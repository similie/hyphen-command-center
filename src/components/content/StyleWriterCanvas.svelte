<script lang="ts">
  import { _t } from "$lib";

  let { content, class: className = "" } = $props<{
    content: string;
    class?: string;
  }>();
</script>

<div
  class={`prose prose-slate dark:prose-invert max-w-none break-words whitespace-normal overflow-x-hidden ${className}`}
>
  {@html content || `<p>${$_t("No content provided.")}</p>`}
</div>
