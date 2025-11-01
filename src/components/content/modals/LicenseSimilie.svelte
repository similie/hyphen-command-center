<script lang="ts">
  import { _t } from "$lib";
  import { Card, Modal, P } from "flowbite-svelte";

  let { open = $bindable() } = $props<{ open: boolean }>();
</script>

<Modal bind:open title={$_t("Similie's Technology")}>
  <div class="space-y-6">
    <!-- Intro -->
    <P>
      <span class="font-semibold text-primary-600">Hyphen Command Center</span>
      is more than an IoT fleet management platform. Our tools are designed to empower
      learning, streamline administration, and scale across organizations. Best of
      all, it can be
      <span class="font-semibold">white-labeled</span> and licensed for third-party
      use—so you can offer a branded, professional solution that meets your community’s
      needs.
    </P>

    <!-- Feature highlights -->
    <div class="grid md:grid-cols-2 gap-4">
      <Card class="p-4">
        <h3 class="text-lg font-semibold mb-2">🌍 Climate Technologies</h3>
        <P class="text-gray-600 dark:text-gray-300 text-sm">
          From early warning systems to IoT-powered climate solutions, Similie’s
          technologies help communities adapt, prepare, and thrive.
        </P>
      </Card>
      <Card class="p-4">
        <h3 class="text-lg font-semibold mb-2">🚚 Logistics & Personnel</h3>
        <P class="text-gray-600 dark:text-gray-300 text-sm">
          Manage operations with precision. Our logistics and personnel systems
          bring efficiency, transparency, and reliability to organizations of
          all sizes.
        </P>
      </Card>
    </div>

    <!-- Call to action -->
    <div class="text-center mt-6">
      <P class="mb-4 text-center">
        Interested in learning more about licensing or our full line of
        products? Contact us today:
      </P>
      <a
        href="mailto:info@similie.org"
        class="inline-block px-6 py-3 rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700 transition"
      >
        info@similie.org
      </a>
    </div>
  </div>
</Modal>
