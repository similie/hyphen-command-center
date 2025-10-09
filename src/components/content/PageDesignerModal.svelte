<script lang="ts">
  import { InputItemsRow } from "$components/input";
  import AvatarBuilder from "$components/input/AvatarBuilder.svelte";
  import InputFormItem from "$components/input/InputFormItem.svelte";
  import StyleWriter from "$components/input/StyleWriter.svelte";
  import { Toast } from "$components/toasts";
  import {
    type PageDesignerContent,
    type PageDesignerContentRow,
    type PageDesignerContentTypeValues,
    type PageDesignerModel,
    type UUID,
    PageDesignerApi,
    PageDesignerContentType,
    _t,
  } from "$lib";
  import {
    A,
    Button,
    ButtonGroup,
    Dropdown,
    DropdownItem,
    Hr,
    Img,
    Input,
    Label,
    Modal,
    P,
    Textarea,
    Toggle,
    Video,
  } from "flowbite-svelte";
  import { FloppyDiskOutline, PlusOutline } from "flowbite-svelte-icons";
  const api = new PageDesignerApi();
  let {
    open = $bindable(),
    page = $bindable(),
    pageKey,
  } = $props<{
    open: boolean;
    pageKey: string;
    page?: PageDesignerModel;
  }>();
  let dirty = $state(false);
  let rows = $state<PageDesignerContentRow[]>(page?.content || []);
  let dropdownOpen = $state(false);
  const addRow = () => {
    const pageDesignerCol: PageDesignerContent[] = [];
    rows.push({ cols: pageDesignerCol });
    dirty = true;
  };

  const setContentRow = (rowIndex: number, type: PageDesignerContentType) => {
    const value: PageDesignerContent = {
      type,
      content: { value: "", meta: { width: "100%" } },
    };
    rows[rowIndex] = rows[rowIndex] ?? { cols: [] };
    rows[rowIndex].cols.push(value);
    dirty = true;
  };

  const saveChanges = async () => {
    try {
      const call = page?.uid
        ? api.update({ content: rows }, { uid: page.uid })
        : api.create({ tag: pageKey, content: rows });

      const results = await call;
      const value = Array.isArray(results) ? results.pop() : results;
      page = value;
      Toast.success("Page saved successfully");
    } catch (e) {
      console.error("Error saving page", e);
    } finally {
      dirty = false;
    }
  };
  const setDirty = () => [(dirty = true)];
</script>

<Modal title="Edit page: {pageKey}" size="xl" bind:open>
  <div class="flex flex-col gap-4 w-full">
    <form oninput={setDirty}>
      {#each rows as row, index}
        <div class="flex flex-start gap-4 w-full">
          <ButtonGroup class="ml-auto mb-4">
            <Button onclick={() => rows.splice(index, 1)} color="red"
              >{$_t("Remove Row")}</Button
            >
            <Button
              onclick={() => (dropdownOpen = true)}
              color="alternative"
              size="xs"><PlusOutline /> {$_t("Add Column")}</Button
            >
            <Dropdown bind:isOpen={dropdownOpen} simple>
              <DropdownItem
                ><A
                  onclick={() =>
                    setContentRow(index, PageDesignerContentType.TEXT)}
                  >{$_t("Text")}</A
                ></DropdownItem
              >
              <DropdownItem
                ><A
                  onclick={() =>
                    setContentRow(index, PageDesignerContentType.HTML)}
                  >{$_t("HTML")}</A
                ></DropdownItem
              >
              <DropdownItem
                ><A
                  onclick={() =>
                    setContentRow(index, PageDesignerContentType.IMAGE)}
                  >{$_t("Image")}</A
                ></DropdownItem
              >
              <DropdownItem
                ><A
                  onclick={() =>
                    setContentRow(index, PageDesignerContentType.VIDEO)}
                  >{$_t("Video")}</A
                ></DropdownItem
              >
            </Dropdown>
          </ButtonGroup>
        </div>

        <div class="flex flex-start gap-4 w-full">
          {#each row.cols as col}
            <div class="w-full flex-col flex space-y-4">
              <Input
                type="text"
                placeholder="Optional Heading"
                bind:value={col.content.heading}
              />
              {#if col.type === "text"}
                <Textarea>{col.content}</Textarea>
              {:else if col.type === "image"}
                <InputItemsRow>
                  <AvatarBuilder bind:avatar={col.content.value as UUID} />
                </InputItemsRow>
                <InputItemsRow>
                  <InputFormItem>
                    <Label>{$_t("Optional Image ALT text")}</Label>
                    <Input
                      bind:value={col.content.alt as string}
                      placeholder="Optional Alt Text"
                    ></Input>
                  </InputFormItem>
                  <InputFormItem>
                    <Label>{$_t("Optional Class Names")}</Label>
                    <Input
                      bind:value={col.content.meta.classNames as string}
                      placeholder="Class Names"
                    ></Input>
                  </InputFormItem>
                </InputItemsRow>

                <InputItemsRow>
                  <InputFormItem>
                    <Label>{$_t("Optional Width")}</Label>
                    <Input
                      bind:value={col.content.meta.width as string}
                      placeholder="Height"
                    ></Input>
                  </InputFormItem>
                  <InputFormItem>
                    <Label>{$_t("Optional Height (default null)")}</Label>
                    <Input
                      bind:value={col.content.meta.height as string}
                      placeholder="Height"
                    ></Input>
                  </InputFormItem>
                  <InputFormItem shrink>
                    <Label>{$_t("Rounded")}</Label>
                    <Toggle
                      bind:checked={col.content.meta.rounded as boolean}
                      placeholder="Height"
                    />
                  </InputFormItem>
                </InputItemsRow>
              {:else if col.type === "video"}
                <!-- <Video
              src={col.content.value}
              width={col.content.meta?.width}
              height={col.content.meta?.height}
            /> -->
              {:else if col.type === "html"}
                <StyleWriter
                  onchange={setDirty}
                  bind:value={col.content.value as string}
                />
              {/if}
            </div>
          {/each}
        </div>
      {/each}
    </form>
    <Hr class="my-4" />

    <div class="flex w-full">
      <Button onclick={addRow} color="alternative"
        ><PlusOutline /> {$_t("Add Row")}</Button
      >

      <Button class="ml-auto" disabled={!dirty} onclick={saveChanges}
        ><FloppyDiskOutline /> {$_t("Save Changes")}</Button
      >
    </div>
  </div>
</Modal>
