<script lang="ts">
  import { CenteredContent } from "$layouts";
  import { ErrorMessages } from "$components";
</script>

<CenteredContent>
  <ErrorMessages
    code={404}
    titleMessage={"Page not found"}
    errorMessage={"We can't find that page. Check the details and try again"}
  />
</CenteredContent>
