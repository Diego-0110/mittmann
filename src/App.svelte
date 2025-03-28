<script lang="ts">
  import Button from "$/components/ui/Button.svelte";
  import Combobox from "$/components/ui/Combobox.svelte";
  import { CirclePlay, StopCircle, Trash2 } from "@lucide/svelte";
  import type { InterceptedResponse, InterceptOptions } from "$/types"
  import InterceptionCard from "./components/InterceptionCard.svelte";
  import { getIDBDatabase } from "./services/db";
  import { addIntRes, removeAll } from "./services/interceptedResponse";
  import { CONTENT_TYPES } from "./constants/contenttypes";

  let interceptedResponses: InterceptedResponse[] = $state([])
  let interceptOptions: InterceptOptions = $state({
    activated: false
  })
  let indexedDb: IDBDatabase | null = $state(null)
  let contentTypeFilters: string[] = $state([])
  chrome.devtools.network.onRequestFinished.addListener((inRequest) => {
    if (!interceptOptions.activated) {
      return
    }
    const devRequest = inRequest as chrome.devtools.network.Request & {
      response: Response & { content: { mimeType: string, size: number }}
      request: Request
    }
    const contentType = devRequest.response.content.mimeType as string
    if (contentTypeFilters.length > 0 && !contentTypeFilters.includes(contentType)) {
      return
    }
    console.log('request', devRequest)
    console.log('response', devRequest.response)
    const name = new URL(devRequest.request.url).pathname.split('/').slice(-1)[0]
    devRequest.getContent((content, encoding) => {
      const newInterceptedResponse: InterceptedResponse = {
        id: self.crypto.randomUUID(),
        contentType: encoding? `${contentType};charset=${encoding}`: contentType,
        name,
        size: devRequest.response.content.size
      }
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
    console.log('combo', contentTypeFilters)
    // console.log(interceptOptions)
    // console.log(interceptedResponses)
  })
</script>

<main class="p-2 max-sm:text-sm">
  <h1 class="text-2xl font-bold mb-2">Mittmann</h1>

  <div class="mb-1 flex flex-wrap gap-1 items-start">
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
  <div class="mb-4 flex flex-wrap gap-1 items-start">
    <Combobox items={CONTENT_TYPES} bind:value={contentTypeFilters}
      inputProps={{ placeholder: 'Content-Type' }} type="multiple"
      onresetitems={() => (contentTypeFilters = [])}
    />
  </div>
  <div class="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1">
    {#each interceptedResponses as intRes}
      <InterceptionCard interceptedResponse={intRes} />
    {/each}
  </div>

</main>
