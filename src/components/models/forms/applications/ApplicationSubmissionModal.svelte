<script lang="ts">
  import DateFormat from "$components/content/DateFormat.svelte";
  import { DynamicForm2 } from "$components/input";
  import UserAvatar from "$components/user/UserAvatar.svelte";
  import {
    type ApplicationModel,
    type ApplicationSubmissionModel,
    FormApplicationApi,
    type FormField,
    type FormModel,
    UserApi,
    type UserModel,
    UserRoles,
    _t,
    siteUser,
  } from "$lib";
  import {
    Button,
    Heading,
    Hr,
    Label,
    Modal,
    P,
    Spinner,
    Textarea,
  } from "flowbite-svelte";
  import { PrinterOutline } from "flowbite-svelte-icons";
  import { onMount } from "svelte";

  let {
    open = $bindable(),
    submission,
    submissionName = "",
  } = $props<{
    open: boolean;
    submission: ApplicationSubmissionModel;
    submissionName?: string;
  }>();
  //ApplicationModel
  const api = new FormApplicationApi();
  const uApi = new UserApi();
  let application = $state<ApplicationModel | undefined>(undefined);
  let loading = $state(false);
  let user = $state<UserModel | undefined>(undefined);
  const applyUser = () => {
    if ($siteUser && submission.user === $siteUser.uid) {
      user = $siteUser;
      return;
    }

    uApi
      .findOne(submission.user)
      .then((_user) => (user = _user))
      .catch((e) => {
        console.error(e);
      });
  };
  let permitted = $derived(() => {
    if (!$siteUser) {
      return false;
    }

    if ($siteUser.role >= UserRoles.USER_MANAGER) {
      return true;
    }
    return submission.user === $siteUser.uid;
  });
  let model = $state(submission.values || {});

  let fields = $derived<() => FormField[]>(() => {
    if (!application || !application.forms) {
      return [];
    }
    let values: FormField[] = [];
    for (const form of application.forms) {
      const formValues: FormModel = form as FormModel;
      values.push(...formValues.form);
    }
    return values;
  });

  // Refs to grab modal body content and a hidden print host
  let modalBodyEl: HTMLElement | null = $state(null);
  let printHostEl: HTMLElement | null = $state(null);

  onMount(() => {
    printHostEl = document.createElement("div");
    printHostEl.id = "print-host";
    document.body.appendChild(printHostEl);

    loading = true;
    api
      .getForms(submission.application)
      .then((app) => {
        application = app;
        loading = false;
      })
      .catch((e) => {
        console.error(e);
        loading = false;
      });
    applyUser();
  });

  function cloneWithValues(srcRoot: HTMLElement): HTMLElement {
    const clone = srcRoot.cloneNode(true) as HTMLElement;
    const src = srcRoot.querySelectorAll("input, textarea, select");
    const dst = clone.querySelectorAll("input, textarea, select");
    dst.forEach((el, i) => {
      const s = src[i] as
        | HTMLInputElement
        | HTMLTextAreaElement
        | HTMLSelectElement;
      if (!s) return;
      if (el instanceof HTMLInputElement) {
        if (["checkbox", "radio"].includes(el.type))
          el.checked = (s as HTMLInputElement).checked;
        else el.value = (s as HTMLInputElement).value;
      } else if (el instanceof HTMLTextAreaElement) {
        el.value = (s as HTMLTextAreaElement).value;
        el.textContent = el.value;
      } else if (el instanceof HTMLSelectElement) {
        el.value = (s as HTMLSelectElement).value;
      }
    });
    return clone;
  }

  async function printModalBody() {
    if (!modalBodyEl || !printHostEl) return;
    printHostEl.innerHTML = "";
    printHostEl.appendChild(cloneWithValues(modalBodyEl));
    // 2 RAFs to ensure layout/styles are ready before print
    await new Promise((r) =>
      requestAnimationFrame(() => requestAnimationFrame(r)),
    );
    window.print();
    // optional cleanup
    setTimeout(() => {
      if (printHostEl) printHostEl.innerHTML = "";
    }, 0);
  }
</script>

<Modal bind:open>
  {#snippet header()}
    <div class="flex w-full pr-9 space-x-4 items-center">
      <Button
        onclick={() => printModalBody()}
        size="xs"
        color="alternative"
        outline={false}
        class="ml-auto-"><PrinterOutline /></Button
      >
      <Heading tag="h5"
        >{$_t(
          `${submissionName || application?.name || $_t("Application")} ${$_t("Submission")}`,
        )}</Heading
      >
    </div>
  {/snippet}

  {#if loading}
    <P class="text-center">{$_t("Loading...")} <Spinner /></P>
  {:else if !permitted()}
    <Heading>{$_t("You are not permitted to view this content")}</Heading>
  {:else}
    <div class="flex-col flex w-full" bind:this={modalBodyEl}>
      <div class="flex items-center space-x-2">
        {#if user}
          <UserAvatar avatar={user.avatar} />
          <div class="flex-col self-end">
            <P class="ml-auto">{`${submissionName || application?.name}`}</P>
            <Heading tag="h3">{user.name}</Heading>
            <div class="flex">
              <div>{$_t("Account Since")}:</div>
              &nbsp;
              <DateFormat stamp={user.created_at} format={"date"} />
            </div>
          </div>
        {/if}
      </div>
      <Hr />
      <DynamicForm2 hideControls edit={false} {model} fields={fields()} />
    </div>
  {/if}
</Modal>

<style>
  /* Keep print host hidden on screen */
  :global(#print-host) {
    display: none;
  }

  @media print {
    /* IMPORTANT: global so it hides everything */
    :global(body *) {
      display: none !important;
    }
    :global(html),
    :global(body) {
      background: #fff !important;
    }

    /* Only show our cloned content */
    :global(#print-host),
    :global(#print-host *) {
      display: block !important;
    }

    :global(#print-host) {
      position: static !important;
      width: auto !important;
      margin: 0 !important;
      padding: 0 !important;
      background: #fff !important;
    }

    /* Optional niceties */
    :global(.no-print) {
      display: none !important;
    }
    :global(.avoid-break) {
      break-inside: avoid;
    }
    @page {
      margin: 12mm;
    }
  }
</style>
