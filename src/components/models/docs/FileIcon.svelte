<script lang="ts">
  import { P, Tooltip } from "flowbite-svelte";
  import {
    FilePdfOutline,
    FileCodeOutline,
    FileDocOutline,
    FileLinesOutline,
    FilePptOutline,
    FileImageOutline,
    FileMusicOutline,
    FileVideoOutline,
    FileWordOutline,
    FileZipOutline,
    FileCsvOutline,
    FileOutline,
  } from "flowbite-svelte-icons";
  import mime from "mime-types";

  let { type, filename } = $props<{ type: string; filename?: string }>();
  const fileTypes = {
    pdf: { icon: FilePdfOutline, color: "red" },
    code: { icon: FileCodeOutline, color: "alternative" },
    doc: { icon: FileDocOutline, color: "blue" },
    word: { icon: FileWordOutline, color: "blue" },
    txt: { icon: FileLinesOutline, color: "primary" },
    pptx: { icon: FilePptOutline, color: "orange" },
    img: { icon: FileImageOutline, color: "primary" },
    sound: { icon: FileMusicOutline, color: "primary" },
    video: { icon: FileVideoOutline, color: "primary" },
    zip: { icon: FileZipOutline, color: "primary" },
    csv: { icon: FileCsvOutline, color: "primary" },
    default: { icon: FileOutline, color: "primary" },
  } as const;
  type FileTypeKey = keyof typeof fileTypes;

  const fileList: Record<FileTypeKey, string[]> = {
    pdf: ["pdf"],
    code: ["html", "htm", "js", "ts", "json"],
    txt: ["txt", "md"],
    word: [
      "doc",
      "docx",
      "openxmlformats-officedocument",
      "document",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    doc: ["odt"],
    pptx: ["ppt", "pptx"],
    img: ["png", "jpg", "jpeg", "gif", "svg", "webp"],
    sound: ["mp3", "wav", "flac", "ogg"],
    video: ["mp4", "webm", "mkv"],
    zip: ["zip", "rar", "7z", "gz", "tgz"],
    csv: ["csv"],
    default: [],
  };

  // figure out an extension from a MIME type or a filename-like string
  const ext = $derived(() => {
    let mimeExtension = undefined;
    const extension =
      type && type.includes(".") ? type.split(".")[1] : mime.extension(type);
    // Only assign if the extension exists and is a valid key in fileTypes
    for (const key in fileList) {
      const fileTypeKey = key as FileTypeKey;
      if (!extension || !fileList[fileTypeKey].includes(extension)) {
        continue;
      }
      mimeExtension =
        fileTypeKey in fileTypes ? (key as FileTypeKey) : undefined;
      break;
    }
    return mimeExtension || "default";
  });

  // map extension -> bucket key
  const kind = $derived.by<FileTypeKey>(() => {
    return ext();
  });
  // ALIAS the component you want to render
  const Icon = $derived(fileTypes[kind].icon);
  const color = $derived<string>(fileTypes[kind].color);
</script>

{#if Icon}
  <!-- now Icon is a valid component identifier -->
  <Icon size="xl" {color} />
  <!-- <Icon.svelte:component color={iconColor} size="xl" /> -->
  <Tooltip>{type}</Tooltip>
{/if}

{#if filename}
  <P size="xs" class="filename">{filename}</P>
{/if}
