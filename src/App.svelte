<script lang="ts">
  import Button from "$/components/ui/Button.svelte";
  import { CirclePlay, StopCircle, Trash2 } from "@lucide/svelte";
  interface InterceptedResponse {
    id: string
    contentType?: string
  }
  let interceptedResponse: InterceptedResponse[] = $state([])
  interface InterceptOptions {
    activated: boolean
  }
  let interceptOptions: InterceptOptions = $state({
    activated: false
  })
  chrome.devtools.network.onRequestFinished.addListener((inRequest) => {
    if (!interceptOptions.activated) {
      return
    }
    const devRequest = inRequest as chrome.devtools.network.Request & { response: Response }
    const contentType = devRequest.response.content.mimeType as string
    devRequest.getContent((content, encoding) => console.log(
      URL.createObjectURL(new Blob([content], { type: contentType }))
    ))
    interceptedResponse = [...interceptedResponse, {
      id: self.crypto.randomUUID(),
      contentType: devRequest.response.content.mimeType || undefined
    }]
  })
  $effect(() => {
    console.log(interceptOptions)
    console.log(interceptedResponse)
  })
</script>

<main class="p-2">
  <h1 class="text-2xl font-bold mb-2">Mittmann</h1>

  <div>
    <Button onclick={() => interceptOptions.activated = !interceptOptions.activated }
      variant={interceptOptions.activated? 'destructive' : 'primary'}>
      {#if interceptOptions.activated}
        <StopCircle class="size-4" />Stop
      {:else}
        <CirclePlay class="size-4" />Intercept
      {/if}
    </Button>
    <Button onclick={() => interceptedResponse = []} variant="secondary">
      <Trash2 class="size-4" />Discard
    </Button>
  </div>

  <div class="space-y-2">
    {#each interceptedResponse as capReq}
      <p>{capReq.id} - {capReq.contentType}</p>
    {/each}
  </div>

</main>
