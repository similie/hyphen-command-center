<script lang="ts">
  import { FormTypeEnum, type FormValueModel, type FormModelValue } from "$lib";
  import { Button, Card } from "flowbite-svelte";
  import {
    ArrowDownToBracketOutline,
    BarsFromLeftOutline,
    BookOutline,
    CalendarEditOutline,
    CheckOutline,
    CircleMinusOutline,
    ClipboardOutline,
    FileOutline,
    MailBoxOutline,
    OrderedListOutline,
    OutdentOutline,
    QuoteOutline,
    WandMagicSparklesOutline,
  } from "flowbite-svelte-icons";
  import FormFieldCreateElementModal from "./FormFieldCreateElementModal.svelte";
  import { Toast } from "$components";
  let { onAdd, length, formElements } = $props<{
    onAdd: (element: FormModelValue, index?: number) => void;
    length: number;
    formElements: FormModelValue[];
  }>();
  const items: FormValueModel[] = $state<FormValueModel[]>([
    {
      name: "Text",
      type: FormTypeEnum.TEXT,
      icon: BarsFromLeftOutline,
    },
    {
      name: "Textarea",
      type: FormTypeEnum.TEXT_AREA,
      icon: BookOutline,
    },
    {
      name: "Rich Text",
      type: FormTypeEnum.RICH_TEXT,
      icon: WandMagicSparklesOutline,
    },
    {
      name: "Number",
      type: FormTypeEnum.NUMBER,
      icon: QuoteOutline,
    },
    {
      name: "Date",
      type: FormTypeEnum.DATE,
      icon: CalendarEditOutline,
    },
    {
      name: "Email",
      type: FormTypeEnum.EMAIL,
      icon: MailBoxOutline,
    },

    {
      name: "Records",
      type: FormTypeEnum.RECORDS,
      icon: OutdentOutline,
    },
    {
      name: "List",
      type: FormTypeEnum.STRING_ARRAY,
      icon: OrderedListOutline,
    },
    {
      name: "Checkbox",
      type: FormTypeEnum.CHECKBOX,
      icon: CheckOutline,
    },
    {
      name: "Check Group",
      type: FormTypeEnum.CHECK_GROUP,
      icon: ClipboardOutline,
    },
    {
      name: "File Upload",
      type: FormTypeEnum.FILE_UPLOAD,
      icon: FileOutline,
    },
    {
      name: "Dropdown",
      type: FormTypeEnum.SELECT,
      icon: ArrowDownToBracketOutline,
    },
    {
      name: "Radio",
      type: FormTypeEnum.RADIO,
      icon: CircleMinusOutline,
    },
  ]);

  let openCreate = $state(false);
  let createField = $state<FormValueModel | null>(null);
  const isValidName = (value: FormModelValue) => {
    let valid = true;

    for (const el of formElements) {
      if (value.name === el.name) {
        valid = false;
        break;
      }
    }
    return valid;
  };
  const validDateAdd = (value: FormModelValue) => {
    if (!value || !value.name) return;

    if (!isValidName(value)) {
      return Toast.error("Field name must be unique");
    }
    createField = null;
    openCreate = false;
    onAdd(value);
  };

  const onAddItems = (item: FormValueModel) => {
    createField = item;
    openCreate = true;
  };
</script>

{#if createField}
  <FormFieldCreateElementModal
    oncancel={() => (createField = null)}
    bind:open={openCreate}
    {createField}
    {length}
    onCreate={validDateAdd}
  />
{/if}

<Card class="p-4 w-xs">
  <div class="flex-col space-y-2">
    {#each items as item}
      <div class="w-full">
        <Button onclick={() => onAddItems(item)} class="w-full">
          <item.icon />
          <span>{item.name}</span>
        </Button>
      </div>
    {/each}
  </div>
</Card>
