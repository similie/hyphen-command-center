<script lang="ts">
  import { type ApplicationDocumentModel, _t, appFileBase } from "$lib";
  import {
    A,
    Table,
    TableBody,
    TableBodyCell,
    TableBodyRow,
    TableHead,
    TableHeadCell,
    Tooltip,
  } from "flowbite-svelte";
  import FileIcon from "./FileIcon.svelte";

  let { documents } = $props<{ documents: ApplicationDocumentModel[] }>();
</script>

<Table hoverable={true}>
  <TableHead>
    <TableHeadCell>{$_t("Type")}</TableHeadCell>
    <TableHeadCell>{$_t("Title")}</TableHeadCell>
  </TableHead>
  <TableBody>
    {#each documents as document}
      <TableBodyRow>
        <TableBodyCell>
          <FileIcon type={document.type} />
        </TableBodyCell>
        <TableBodyCell>
          <div class="flex flex-col">
            <A
              href={appFileBase(document.uid)}
              download={document.name}
              class="text-gray-500 text-xs max-w-64 text-nowrap text-ellipsis truncate cursor-pointer"
              >{document.name}</A
            >
            <Tooltip trigger="hover">{document.name}</Tooltip>
          </div>
        </TableBodyCell>
      </TableBodyRow>
    {/each}
  </TableBody>
</Table>
