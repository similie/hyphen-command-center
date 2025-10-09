<script lang="ts">
  import { CenteredContent } from "$layouts";
  import { ErrorMessages } from "$components";
</script>

<CenteredContent>
  <ErrorMessages
    code={401}
    titleMessage={"Unauthorized"}
    errorMessage={"We can't let you go there without logging in first"}
  />
</CenteredContent>
