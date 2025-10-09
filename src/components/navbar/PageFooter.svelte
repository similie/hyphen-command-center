<script lang="ts">
  import { page } from "$app/state";
  import { _t } from "$lib";
  import { LicenseAgreement, LicenseSimilie, SimilieLogo } from "$components";
  import { BottomNav, BottomNavItem, A, Img } from "flowbite-svelte";
  import {
    ClipboardCheckSolid,
    ClipboardOutline,
    FacebookSolid,
    GithubSolid,
    LinkedinSolid,
  } from "flowbite-svelte-icons";

  let open = $state(false);
  let openLicense = $state(false);
</script>

<LicenseAgreement
  bind:open
  licenseAgreement={page.data.licenseAgreement}
  contentOnly
/>

<LicenseSimilie bind:open={openLicense} />

<BottomNav
  activeUrl={"/"}
  position="relative"
  outerClass="bg-white dark:bg-gray-950 mx-auto- border-transparent"
  innerClass="flex "
>
  <BottomNavItem>
    <A class="text-nowrap" href="https://similie.com" target="_blank">
      <div class="flex items-center">
        <SimilieLogo
          height="20"
          width="20"
          overrideColor="#19cee9,#06c4de"
        />&nbsp;{$_t("Similie")}
      </div>
    </A>
  </BottomNavItem>
  <BottomNavItem
    ><A href="#" class="text-nowrap" onclick={() => (open = true)}
      ><ClipboardCheckSolid />&nbsp;{$_t("Usage Agreement")}</A
    ></BottomNavItem
  >

  <!-- <BottomNavItem
    ><A class="text-nowrap" href="https://github.com/similie" target="_blank"
      ><GithubSolid />&nbsp;{$_t("Github")}</A
    ></BottomNavItem
  > -->
  <BottomNavItem
    ><A
      class="text-nowrap"
      href="https://www.facebook.com/similieacademy"
      target="_blank"><FacebookSolid />&nbsp;{$_t("Facebook")}</A
    ></BottomNavItem
  >

  <BottomNavItem
    ><A
      class="text-nowrap"
      href="https://www.linkedin.com/company/similie"
      target="_blank"><LinkedinSolid />&nbsp;{$_t("LinkedIn")}</A
    ></BottomNavItem
  >

  <BottomNavItem
    ><A class="text-nowrap" onclick={() => (openLicense = true)}
      ><ClipboardOutline />&nbsp;{$_t("License")}</A
    ></BottomNavItem
  >
</BottomNav>
