<script lang="ts">
  import Button from "$/components/ui/Button.svelte";
  import { CirclePlay, StopCircle, Trash2 } from "@lucide/svelte";
  import type { InterceptedResponse, InterceptOptions } from "$/types"
    import InterceptionCard from "./components/InterceptionCard.svelte";
    import { getIDBDatabase } from "./services/db";
    import { addIntRes, removeAll } from "./services/interceptedResponse";

  let interceptedResponses: InterceptedResponse[] = $state([])
  let interceptOptions: InterceptOptions = $state({
    activated: false
  })
  let indexedDb: IDBDatabase | null = $state(null)
  chrome.devtools.network.onRequestFinished.addListener((inRequest) => {
    if (!interceptOptions.activated) {
      return
    }
    const devRequest = inRequest as chrome.devtools.network.Request & { response: Response }
    const contentType = devRequest.response.content.mimeType as string
    devRequest.getContent((content, encoding) => {
      const newInterceptedResponse: InterceptedResponse = {
        id: self.crypto.randomUUID(),
        contentType: encoding? `${contentType};charset=${encoding}`: contentType
      }
      console.log('content', contentType, content, encoding)
      interceptedResponses = [...interceptedResponses, newInterceptedResponse]
      if (indexedDb) {
        addIntRes(indexedDb, {
          ...newInterceptedResponse,
          content,
        })
      }
    })
  })
  function handleDiscard () {
    interceptedResponses = []
    if (indexedDb) {
      removeAll(indexedDb)
    }
  }
  $effect(() => {
    getIDBDatabase().then((db) => indexedDb = db)
  })
  $effect(() => {
    console.log(interceptOptions)
    console.log(interceptedResponses)
  })
</script>

<main class="p-2">
  <h1 class="text-2xl font-bold mb-2">Mittmann</h1>

  <div class="mb-4">
    <Button onclick={() => interceptOptions.activated = !interceptOptions.activated }
      variant={interceptOptions.activated? 'destructive' : 'primary'}>
      {#if interceptOptions.activated}
        <StopCircle class="size-4" />Stop
      {:else}
        <CirclePlay class="size-4" />Intercept
      {/if}
    </Button>
    <Button onclick={handleDiscard} variant="secondary">
      <Trash2 class="size-4" />Discard
    </Button>
  </div>

  <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1">
    {#each interceptedResponses as intRes}
      <InterceptionCard interceptedResponse={intRes} />
    {/each}
  </div>

</main>
