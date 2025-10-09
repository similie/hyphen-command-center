<script lang="ts">
  import { CreateApplicationModel, DynamicForm2 } from "$components";
  import {
    WomanEarthHugging,
    WomanEarthHuggingDark,
  } from "flowbite-svelte-illustrations";
  import {
    type ApplicationModel,
    type FormModel,
    type FormModelValue,
    type ApplicationSubmissionModel,
    _t,
    extractFormToJson,
    OnSubmitAction,
    ApplicationSubmissionApi,
    userApplications,
    siteUser,
    Debounce,
    delay,
    type UUID,
  } from "$lib";
  import ChevronLeft from "@tabler/icons-svelte/icons/chevron-left";
  import ChevronRight from "@tabler/icons-svelte/icons/chevron-right";
  import {
    DetailedStepper,
    type DetailedStep,
    Button,
    Hr,
    Heading,
    P,
    Spinner,
  } from "flowbite-svelte";
  import { onMount } from "svelte";

  let {
    application,
    onsubmit,
    editor = false,
    onSubmitAction = OnSubmitAction.CLEAR,
    locked = $bindable(),
    autosave = false,
    submission,
    onsave,
    identifier,
    onsumbmission,
  } = $props<{
    application: ApplicationModel;
    editor?: boolean;
    onsubmit?: (
      app: ApplicationModel,
      details: ApplicationSubmissionModel,
    ) => void;
    onSubmitAction?: OnSubmitAction;
    locked?: boolean;
    autosave?: boolean;
    submission?: UUID;
    identifier?: UUID;
    onsave?: (submission: ApplicationSubmissionModel) => void;
    onsumbmission?: (submission: ApplicationSubmissionModel) => void;
  }>();

  const api = new ApplicationSubmissionApi(application);
  let strapping = $state(false);
  let page = $state(0);
  let dirty = $state(false);
  let model = $state<Record<string, any>>({});
  const originalForms = () => {
    return application.forms.filter((f: FormModel) => f.active) || [];
  };

  let forms = $state<FormModel[]>(originalForms());
  let steps: DetailedStep[] = $state([]);
  let changing = $state(false);
  let autosaving = $state(false);
  let isDisabled = $state(true);
  let submitting = $state(false);
  let token = $state<string | undefined>(undefined);
  let onModelRequest = $state<(() => void) | undefined>(undefined);
  const debounce = new Debounce();

  const resetChange = () => {
    changing = true;
    return () => {
      setTimeout(() => {
        changing = false;
      }, 0);
    };
  };
  const step = (forward = true) => {
    onModelRequest && onModelRequest();
    dirty = false;
    const c = resetChange();
    let newPage = forward ? page + 1 : page - 1;
    if (newPage < 0) {
      newPage = 0;
    } else if (newPage >= forms.length) {
      newPage = forms.length - 1;
    }

    if (forward) {
      steps[page].status = "completed";
      steps[newPage].status = "current";
    } else {
      steps[page].status = "pending";
      steps[newPage].status = "current";
    }
    page = newPage;
    c();
  };

  const sendSavedForm = debounce.bounce(() => {
    if (!autosave || strapping || !token) {
      return;
    }
    const values = $state.snapshot(model);
    autosaving = true;
    // console.log("SAVING SOME VALUES", values);
    api.save(values, token).then((saved) => {
      const app = Array.isArray(saved) ? saved[0] : saved;
      autosaving = false;
      dirty = true;
      onsave && onsave(app);
    });
  }, 1000);

  const wrapReviewValues = () => {
    const allValues: FormModelValue[] = [];
    for (const af of application.forms) {
      allValues.push(...af.form);
    }
    const formModel: FormModel = {
      uid: application.uid,
      name: $_t("Review"),
      form: allValues,
      role: application.role,
      active: true,
      created_at: new Date(),
      updated_at: new Date(),
    };
    return formModel;
  };

  const setValues = () => {
    const values: DetailedStep[] = [];
    const formValues = originalForms();
    for (let i = 0; i < formValues.length; i++) {
      const form = formValues[i];
      values.push({
        label: form.name,
        // description: form.description || "",
        id: 1 + i,
        status: i === 0 ? "current" : "pending",
      });
    }

    values.push({
      id: values.length + 1,
      label: $_t("Review"),
      status: "pending",
    });
    return values;
  };
  let attempt = 0;
  const MAX_ATTEMPTS = 5;
  const getApplicationKey = async () => {
    if ($siteUser) {
      return api.applicationKey($siteUser, identifier);
    }
    if (attempt > MAX_ATTEMPTS) {
      throw new Error($_t("Max attempts reached"));
    }

    await delay(300);
    return getApplicationKey();
  };

  const getApplicationValues = async (): Promise<string> => {
    const userKey = await getApplicationKey();
    const applications = userApplications();
    return new Promise((resolve) => {
      const un = applications.subscribe((apps) => {
        const values = apps[userKey] || "";
        resolve(values);
      });
      un();
    });
  };

  const terminateToken = async () => {
    const userKey = await getApplicationKey();
    const applications = userApplications();
    applications.update((apps) => {
      delete apps[userKey];
      return apps;
    });
  };

  const saveToken = async (token: string) => {
    const userKey = await getApplicationKey();
    const applications = userApplications();
    applications.update((apps) => {
      apps[userKey] = token;
      return apps;
    });
  };

  const joinValues = (values: Record<string, any>) => {
    model = {
      ...model,
      ...values,
    };
  };

  const joinAndReset = (values: Record<string, any> = {}) => {
    const c = resetChange();
    if (Object.keys(values).length) {
      dirty = true;
    }
    joinValues(values);
    c();
  };

  const startApplication = async (): Promise<string> => {
    const result = await api.start();
    if (!result.token) {
      throw new Error("Failed to start application");
    }
    onsumbmission && onsumbmission(result);
    return result.token;
  };

  const retrieveValidApplication = async (token?: string) => {
    let result = null;
    if (!token) {
      if (!submission) {
        terminateToken();
        throw new Error("No submission found");
      }
      result = await api.searchSession(submission);
      token = result.token;
      saveToken(token as string);
    } else {
      result = await api.retrieve(token);
    }

    if (!result) {
      throw new Error("Failed to retrieve application");
    }
    return result;
  };

  const retrieveApplication = async (token?: string) => {
    const result = await retrieveValidApplication(token);
    // console.log("Retrieved application:", result);
    if (!result) {
      throw new Error("Failed to retrieve application");
    }
    joinAndReset(result.values);
    onsave && onsave(result);
    return result;
  };

  const buildAutoSaveApplication = async () => {
    try {
      strapping = true;
      submitting = true;
      let applicationToken = await getApplicationValues();
      if (!applicationToken && !submission) {
        applicationToken = await startApplication();
        await saveToken(applicationToken);
      } else {
        await retrieveApplication(applicationToken);
      }
      token = token || applicationToken;
    } catch (e) {
      console.error("Error starting application:", e);
    } finally {
      submitting = false;
      strapping = false;
    }
  };

  const mountAction = () => {
    steps = setValues();
    forms.push(wrapReviewValues());
    if (!autosave) {
      return;
    }
    buildAutoSaveApplication();
  };

  onMount(mountAction);

  const onsubmitLocal = (form: FormData) => {
    dirty = true;
    const values = extractFormToJson(form);
    joinValues(values);
    // console.log("Form submitted:", model);
    sendSavedForm();
  };

  const zeroForm = () => {
    dirty = false;
    page = 0;
    steps = setValues();
  };

  const retainForm = () => {
    const c = resetChange();
    zeroForm();
    c();
  };

  const clearForm = () => {
    const c = resetChange();
    model = {};
    zeroForm();
    terminateToken();
    c();
  };

  const completeForm = async (
    data: Record<string, any>,
  ): Promise<ApplicationSubmissionModel> => {
    if (!token) {
      throw new Error("Token unavailable to complete transaction");
    }
    return api.complete(data, token).then((created) => {
      onsubmit && onsubmit(application, created);
      return created;
    });
  };

  const createForm = async (data: Record<string, any>) => {
    if (editor) {
      return;
    }
    if (autosave) {
      return completeForm(data);
    }

    return api.create(data).then((created: ApplicationSubmissionModel) => {
      onsubmit && onsubmit(application, created);
      onsumbmission && onsumbmission(created);
      return created;
    });
  };

  const sendForm = async () => {
    submitting = true;
    const sendModel = { ...$state.snapshot(model) };
    await createForm(sendModel);
    switch (onSubmitAction) {
      case OnSubmitAction.LOCK:
        locked = true;
      case OnSubmitAction.CLEAR:
        clearForm();
        break;
      case OnSubmitAction.RETAIN:
        retainForm();
        break;
    }
    submitting = false;
  };

  const onAction = (app: ApplicationModel) => {
    application = app;
    forms = originalForms();
    mountAction();
    clearForm();
  };
</script>

<div class="flex w-full">
  {#if editor}
    <!---->
    <div class="">
      <CreateApplicationModel model={application} {onAction} />
    </div>
  {/if}
  <div class="max-w-3xl mx-auto p-8 flex-grow">
    {#if locked}
      <!---->
      <Heading class="text-center">
        {`${application.name} ${$_t("Submitted")}`}
      </Heading>
      <Hr />
      <div class="flex w-ful">
        <div class="dark:hidden mx-auto">
          <WomanEarthHugging />
        </div>
        <div class="hidden dark:block mx-auto">
          <WomanEarthHuggingDark />
        </div>
      </div>
      <P class="text-center mt-4"
        >{$_t(
          "We thank you for taking the time to complete this application.",
        )}</P
      >
    {:else if !changing && !strapping}
      <DynamicForm2
        bind:isDisabled
        hideControls
        edit={page < forms.length - 1 && !submitting}
        {model}
        bind:onModelRequest
        onsubmit={onsubmitLocal}
        fields={forms[page]?.form as FormModelValue[]}
      />
    {/if}
    <div class="h-8 w-full flex">
      <div class="ml-auto text-sm flex text-primary-600 dark:text-primary-400">
        {#if autosaving}
          {$_t("Saving... ")}
          <Spinner size={"6"} />
        {/if}
      </div>
    </div>
  </div>
</div>
{#if !locked}
  <Hr />
  <div class="flex align-middle">
    {#if forms.length > 0}
      <Button
        disabled={page === 0}
        color="alternative"
        onclick={() => step(false)}><ChevronLeft /> {$_t("Back")}</Button
      >
    {/if}
    <DetailedStepper class="justify-center" {steps} />
    {#if page < forms.length - 1}
      <Button
        disabled={!dirty || isDisabled}
        class="ml-auto"
        onclick={() => step(true)}>{$_t("Forward")} <ChevronRight /></Button
      >
    {:else}
      <Button class="ml-auto" disabled={submitting} onclick={sendForm}>
        {#if submitting}
          {$_t("Submitting...")} <Spinner />
        {:else}
          {$_t("Submit")}
        {/if}
      </Button>
    {/if}
  </div>
{/if}
