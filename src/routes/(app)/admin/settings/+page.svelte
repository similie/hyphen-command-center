<script lang="ts">
  import { PageEditor } from "$components";

  import { BodyContainer } from "$layouts";
  import {
    siteConfig,
    UserRoles,
    UserRolesStrings,
    SiteConfigApi,
    type FormField,
    type ModelTab,
    type SiteConfig,
  } from "$lib";

  const api = new SiteConfigApi();

  const configSchema: FormField[] = [
    {
      name: "siteName",
      label: "Site Name",
      type: "text",
      value: $siteConfig.siteName,
      required: true,
    },
    {
      name: "publicSite",
      label: "Public Site",
      type: "checkbox",
      value: $siteConfig.publicSite,
      required: false,
    },
    {
      name: "siteDescription",
      label: "Site Description",
      type: "textarea",
      value: $siteConfig.siteDescription,
      required: false,
    },
    {
      name: "defaultLocaleName",
      label: "Default Locale Name",
      type: "text",
      value: $siteConfig.defaultLocaleName,
      required: true,
    },
    {
      name: "googleMapsKey",
      label: "Google Maps Key",
      type: "text",
      value: $siteConfig.googleMapsKey,
      required: false,
    },
    {
      name: "defaultTheme",
      label: "Default Theme",
      type: "select",
      value: $siteConfig.defaultTheme,
      required: true,
      selectOptions: [
        { name: "Light", value: "light" },
        { name: "Dark", value: "dark" },
      ],
    },

    {
      name: "apiBaseUrl",
      label: "Api Base Url",
      type: "text",
      value: $siteConfig.apiBaseUrl,
      required: true,
    },

    {
      name: "applicationApi",
      label: "Application Api",
      type: "text",
      value: $siteConfig.applicationApi,
      required: true,
    },
    {
      name: "currencyDivisor",
      label: "Currency Divisor",
      type: "number",
      value: $siteConfig.currencyDivisor || 100,
      required: true,
    },

    {
      name: "currency",
      label: "Currency",
      type: "text",
      value: $siteConfig.currency || "USD",
      required: true,
    },

    {
      name: "currencySymbol",
      label: "Currency Symbol",
      type: "text",
      value: $siteConfig.currencySymbol || "$",
      required: true,
    },

    {
      name: "paymentTimeout",
      label: "Payment Timeout",
      type: "number",
      value: $siteConfig.paymentTimeout || 7,
      required: true,
    },

    {
      name: "defaultRole",
      label: "Default User Role",
      type: "select",
      value: $siteConfig.defaultRole,
      required: true,
      selectOptions: [
        { name: UserRolesStrings.ADMIN, value: UserRoles.ADMIN },
        { name: UserRolesStrings.USER_MANAGER, value: UserRoles.USER_MANAGER },
        { name: UserRolesStrings.MANAGER, value: UserRoles.MANAGER },
        { name: UserRolesStrings.USER, value: UserRoles.USER },
        { name: UserRolesStrings.GUEST, value: UserRoles.GUEST },
        { name: UserRolesStrings.BLOCKED, value: UserRoles.BLOCKED },
      ],
    },

    {
      name: "logos",
      label: "Application Logos",
      type: "object",
      value: $siteConfig.logos,
      required: false,
    },

    {
      name: "location",
      label: "Site Location",
      type: "textarea",
      value: $siteConfig.location,
      required: false,
    },

    {
      name: "coordinates",
      label: "Site Coordinates",
      type: "object",
      value: $siteConfig.coordinates,
      required: false,
    },
  ];
  let siteModel: SiteConfig | null = null;
  $effect(() => {
    siteModel = $siteConfig;
  });

  const tabs: ModelTab[] = [
    {
      schema: configSchema,
      model: siteModel,
      headings: [{ title: "Site Config" }],
      name: "site-config",
      heading: "Site Config",
      active: true,
    },
  ];

  const onSubmit = async (
    e: CustomEvent<{ form: FormData; data: any; name: string }>,
  ) => {
    const { data } = e.detail;
    try {
      // Convert the data to the correct types if necessary
      const stored = await api.update(data, { id: $siteConfig.id });
      siteConfig.set(stored);
    } catch (e) {
      console.error("Config save error");
    }
  };
</script>

<BodyContainer>
  <PageEditor title="Site Administration" on:submit={onSubmit} {tabs} />
</BodyContainer>
