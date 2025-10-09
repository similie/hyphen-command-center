<script lang="ts">
  import { Toast } from "$components";
  import { copyToClipboard } from "$lib";

  let {
    className = "",
    text,
    overrideText,
  } = $props<{ className?: string; text: string; overrideText?: string }>();

  const copyToClipboardLocal = () => {
    const textToCopy = overrideText || text;
    copyToClipboard(textToCopy, () => {
      Toast.success("Text copied to clipboard");
    });
  };
</script>

<div class="flex space-x-1">
  <div
    role="button"
    tabindex="0"
    class="bg-gray-400 dark:bg-gray-600 p-1 rounded-lg cursor-pointer {className} text-gray-100 hover:bg-gray-700"
    aria-label="Copy to clipboard"
    onclick={copyToClipboardLocal}
    onkeydown={(e) => {}}
  >
    <pre>{text}</pre>
  </div>
</div>
