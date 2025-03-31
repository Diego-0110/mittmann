<script lang="ts">
  import Button from "$/components/ui/Button.svelte";
  import Combobox from "$/components/ui/Combobox.svelte";
  import { CirclePlay, Download, StopCircle, Trash2 } from "@lucide/svelte";
  import type { InterceptedResponse, InterceptOptions } from "$/types"
  import InterceptionCard from "./components/InterceptionCard.svelte";
  import { getIDBDatabase } from "./services/db";
  import { addIntRes, getIntRes, deleteAll, deleteIntRes } from "./services/interceptedResponse";
  import { CONTENT_TYPES } from "./constants/contenttypes";
  import { SvelteSet } from "svelte/reactivity";
  import mime from "mime-types";
  // import Compressor from "compressorjs";
  // import { base64ToFile, blobToDataUrl } from "./utils/misc";

  let interceptedResponses: InterceptedResponse[] = $state([])
  let interceptOptions: InterceptOptions = $state({
    activated: false
  })
  let indexedDb: IDBDatabase | null = $state(null)
  let contentTypeFilters: string[] = $state([])
  let selectedResponses: string[] = $state([])
  let setSelRes: SvelteSet<string> = $state(new SvelteSet())

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
    const name = new URL(devRequest.request.url).pathname.split('/').slice(-1)[0]
    devRequest.getContent(async (content, defEncoding) => {
      if (!content) {
        return
      }
      const encoding = defEncoding || mime.charset(contentType) || undefined
      const newInterceptedResponse: InterceptedResponse = {
        id: self.crypto.randomUUID(),
        contentType: encoding && encoding !== 'base64'?
          `${contentType};charset=${encoding.toLowerCase()}`: contentType,
        encoding,
        name,
        size: devRequest.response.content.size
      }

      // if (contentType.includes('image')) {
      //   new Compressor(base64ToFile(content, contentType), {
      //     maxWidth: 10, maxHeight: 10,
      //     success: async (result) => {
      //       const resultUrl = await blobToDataUrl(result)
      //       console.log('compress', resultUrl) 
      //     },
      //     error: (err) => console.log(err)
      //   })
      // }
      interceptedResponses = [...interceptedResponses, newInterceptedResponse]
      if (indexedDb) {
        addIntRes(indexedDb, {
          ...newInterceptedResponse,
          content,
        })
      }
    })
  })
  async function handleDeleteAll () {
    interceptedResponses = []
    selectedResponses = []
    setSelRes.clear()
    if (indexedDb) {
      await deleteAll(indexedDb)
    }
  }
  function handleSelection (selected: boolean, id: string) {
    if (selected) {
      selectedResponses = [...selectedResponses, id]
      setSelRes.add(id)
    } else {
      selectedResponses = selectedResponses.filter((sid) => sid !== id)
      setSelRes.delete(id)
    }
  }
  async function handleDownload () {
    if (indexedDb) {
      for (let i = 0; i < selectedResponses.length; i++) {
        const irid = selectedResponses[i]
        const irEx = await getIntRes(indexedDb, irid)
        const url = `data:${irEx.contentType};base64,${irEx.content}`
        chrome.downloads.download({ url })
      }
    }
  }
  async function handleDelete () {
    if (indexedDb) {
      for (let i = 0; i < selectedResponses.length; i++) {
        const irid = selectedResponses[i]
        await deleteIntRes(indexedDb, irid)
      }
    }
    interceptedResponses = interceptedResponses.filter((ir) => !setSelRes.has(ir.id))
    selectedResponses = []
    setSelRes.clear()
  }
  function handleSelectAll (selected: boolean) {
    if (selected) {
      selectedResponses = [...interceptedResponses.map((r) => r.id)]
      interceptedResponses.forEach((r) => setSelRes.add(r.id))
    } else {
      selectedResponses = []
      setSelRes.clear()
    }
  }
  $effect(() => {
    getIDBDatabase().then((db) => indexedDb = db)
  })
  $effect(() => {
  })
</script>

<main class="max-sm:text-sm pb-4">
  <header class="sticky top-0 p-2 bg-surface mb-2">
    <div class="mb-1 flex flex-wrap gap-1 items-center">
      <Button onclick={() => interceptOptions.activated = !interceptOptions.activated }
        variant={interceptOptions.activated? 'destructive' : 'primary'}>
        {#if interceptOptions.activated}
          <StopCircle class="size-4" />Stop
        {:else}
          <CirclePlay class="size-4" />Intercept
        {/if}
      </Button>
      <Button onclick={handleDeleteAll} variant="secondary">
        <Trash2 class="size-4" />Discard
      </Button>
    </div>
    <div class="flex flex-wrap gap-1 items-start mb-2">
      <Combobox items={CONTENT_TYPES} bind:value={contentTypeFilters}
        inputProps={{ placeholder: 'Content-Type' }} type="multiple"
        onresetitems={() => (contentTypeFilters = [])}
      />
    </div>
    <div class="flex gap-4 items-center justify-between flex-wrap">
      <p class="text-text/50">
        {interceptedResponses.length} Response/s
      </p>
      <div class="flex gap-1 items-center">
        <p class="px-1 text-sm text-text/50">
          {selectedResponses.length} selected
        </p>
        <input type="checkbox"
          checked={selectedResponses.length > 0}
          disabled={interceptedResponses.length < 1}
          onchange={(evt) => handleSelectAll(evt.currentTarget.checked)}
        />
        <Button variant="primary" disabled={selectedResponses.length < 1}
          onclick={handleDownload}>
          <Download class="size-4" />
        </Button>
        <Button variant="destructive" disabled={selectedResponses.length < 1}
          onclick={handleDelete}>
          <Trash2 class="size-4" />
        </Button>
      </div>
    </div>
  </header>
  <div class="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1 px-2">
    {#each interceptedResponses as intRes}
      <InterceptionCard interceptedResponse={intRes} selected={setSelRes.has(intRes.id)}
        onSelection={handleSelection} />
    {/each}
  </div>
</main>
