<script lang="ts">
  import { _t } from "$lib";
  import { Badge } from "flowbite-svelte";

  let { method } = $props<{ method: string }>();
  const getColor = () => {
    switch (method) {
      case "GET":
        return undefined;
      case "POST":
        return "green";
      case "PUT":
        return "yellow";
      case "DELETE":
        return "red";
      case "*":
        return "purple";
      default:
        return "dark";
    }
  };
</script>

<Badge large color={getColor()}>{method === "*" ? $_t("All") : method}</Badge>
