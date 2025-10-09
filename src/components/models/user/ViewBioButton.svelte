<script lang="ts">
  import { DateFormat, StyleWriterCanvas } from "$components/content";
  import { UserAvatar } from "$components/user";
  import { type UserModel, _t } from "$lib";
  import { A, Button, Heading, Hr, Modal, P, Span } from "flowbite-svelte";
  import { ProfileCardOutline } from "flowbite-svelte-icons";
  import type { Snippet } from "svelte";

  let {
    user,
    disabled,
    size = "xs",
    content,
    link,
  } = $props<{
    user: UserModel;
    disabled?: boolean;
    size?: string;
    content?: Snippet;
    link?: string;
  }>();

  let openBio = $state(false);
</script>

<Modal title={user.name} bind:open={openBio}>
  <div class="flex items-center space-x-2">
    <UserAvatar avatar={user.avatar} />
    <div class="flex-col self-end">
      {@render content?.()}

      <Heading tag="h3">{user.name}</Heading>
      <div class="flex">
        <div>{$_t("Account Since")}:</div>
        &nbsp;
        <DateFormat stamp={user.created_at} format={"date"} />
      </div>
    </div>
  </div>
  <Hr />

  {#if !user.bio}
    <div class="mt-4 mb-4">
      <P class="text-center">{$_t("No bio available")}</P>
    </div>
  {:else}
    <StyleWriterCanvas content={user.bio} />
  {/if}

  {#snippet footer()}
    <Span></Span>
  {/snippet}
</Modal>
{#if link}
  <A onclick={() => (openBio = true)} href="#">{$_t(link)}</A>
{:else}
  <Button
    color="alternative"
    {disabled}
    onclick={() => (openBio = true)}
    {size}
  >
    <ProfileCardOutline />
  </Button>
{/if}
