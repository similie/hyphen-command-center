<script lang="ts">
  import { CenteredContent } from "$layouts";
  import { ErrorMessages } from "$components";
</script>

<CenteredContent>
  <ErrorMessages
    code={500}
    titleMessage={"Server Error"}
    errorMessage={"We encountered an error while processing your request. Please try again later."}
  />
</CenteredContent>
