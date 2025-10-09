<script lang="ts">
  import { CenteredContent } from "$layouts";
  import { ErrorMessages } from "$components";
</script>

<CenteredContent>
  <ErrorMessages
    code={403}
    titleMessage={"Forbidden"}
    errorMessage={"We can't let you go there"}
  />
</CenteredContent>
