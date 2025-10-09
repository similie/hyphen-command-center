<script lang="ts">
  import { CenteredContent } from "$layouts";
  import { ErrorMessages } from "$components";
</script>

<CenteredContent>
  <ErrorMessages
    code={400}
    titleMessage={"Bad Request"}
    errorMessage={"Check your input and try again"}
  />
</CenteredContent>
