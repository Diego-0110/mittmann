<script lang="ts">
import Button from "$/components/ui/Button.svelte";
import Combobox from "$/components/ui/Combobox.svelte";
import Checkbox from "$/components/ui/Checkbox.svelte";
import { CirclePlay, Download, StopCircle, Trash2 } from "@lucide/svelte";
import type { InterceptedResponse, InterceptOptions } from "$/types"
import InterceptionCard from "./components/InterceptionCard.svelte";
import { getIDBDatabase } from "./services/db";
import { addIntRes, getIntRes, deleteAll, deleteIntRes, getIntResAll } from "./services/interceptedResponse";
import { SvelteSet } from "svelte/reactivity";
import { indexedDBState as indexedDB } from "$/states/indexedDB.svelte";
import mime from "mime-types";
import { responseToDataURL, sizeToStr } from "./utils/misc";

let interceptedResponses: InterceptedResponse[] = $state([])
let interceptOptions: InterceptOptions = $state({
  activated: false
})
let contentTypeFilters: string[] = $state([])
let selectedResponses: string[] = $state([])
let setSelRes: SvelteSet<string> = $state(new SvelteSet())
const CONTENT_TYPES = [...new Set(Object.values(mime.types).sort()).values()]
.map((c) => ({ value: c, label: c }))
let totalResSize = $state(0)
let totalSelSize = $state(0)

chrome.devtools.network.onRequestFinished.addListener((inRequest) => {
  if (!interceptOptions.activated) {
    return
  }
  const devRequest = inRequest as chrome.devtools.network.Request & {
    response: Response & { content: { mimeType: string, size: number },
      headers: { name: string, value: string }[] }
    request: Request
  }
  let contentType = devRequest.response.content.mimeType as string
  const headerContentType = devRequest.response.headers.find((h) => h.name === 'content-type')
  contentType = contentType !== 'x-unknown' || !headerContentType?.value ? contentType
    : headerContentType?.value.split(';')[0]
  if (contentTypeFilters.length > 0 && !contentTypeFilters.includes(contentType)) {
    return
  }
  const name = new URL(devRequest.request.url).pathname.split('/').slice(-1)[0]
  devRequest.getContent(async (content, defEncoding) => {
    if (!content) {
      return
    }
    const encoding = defEncoding || mime.charset(contentType) || undefined
    const size = devRequest.response.content.size
    const newInterceptedResponse: InterceptedResponse = {
      id: self.crypto.randomUUID(),
      contentType: encoding && encoding !== 'base64'?
        `${contentType};charset=${encoding.toLowerCase()}`: contentType,
      encoding,
      name,
      size
    }

    interceptedResponses = [...interceptedResponses, newInterceptedResponse]
    totalResSize += size
    if (indexedDB.db) {
      addIntRes(indexedDB.db, {
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
  totalResSize = 0
  totalSelSize = 0
  if (indexedDB.db) {
    await deleteAll(indexedDB.db)
  }
}
function handleSelection (selected: boolean, ir: InterceptedResponse) {
  if (selected) {
    selectedResponses = [...selectedResponses, ir.id]
    setSelRes.add(ir.id)
    totalSelSize += ir.size
  } else {
    selectedResponses = selectedResponses.filter((sid) => sid !== ir.id)
    setSelRes.delete(ir.id)
    totalSelSize -= ir.size
  }
}
async function handleDownload () {
  if (indexedDB.db) {
    for (let i = 0; i < selectedResponses.length; i++) {
      const irid = selectedResponses[i]
      const irEx = await getIntRes(indexedDB.db, irid)
      const hasExt = mime.extensions[irEx.contentType.split(';')[0]]?.some(
        (e) => irEx.name.endsWith(e))
      const defExt = mime.extension(irEx.contentType)
      let filename = irEx.name || 'download' // default value
      if (!hasExt && defExt) {
        filename += `.${defExt}`
      }
      chrome.downloads.download({
        url: responseToDataURL(irEx),
        filename: filename?.replace(/[/\\?%*:|"<>]/g, '')
      })
    }
  }
}
async function handleDelete () {
  if (indexedDB.db) {
    for (let i = 0; i < selectedResponses.length; i++) {
      const irid = selectedResponses[i]
      await deleteIntRes(indexedDB.db, irid)
    }
  }
  interceptedResponses = interceptedResponses.filter((ir) => !setSelRes.has(ir.id))
  selectedResponses = []
  setSelRes.clear()
  totalResSize -= totalSelSize
  totalSelSize = 0
}
function handleSelectAll (selected: boolean) {
  if (selected) {
    selectedResponses = [...interceptedResponses.map((r) => r.id)]
    interceptedResponses.forEach((r) => setSelRes.add(r.id))
    totalSelSize = totalResSize
  } else {
    selectedResponses = []
    setSelRes.clear()
    totalSelSize = 0
  }
}

$effect(() => {
  getIDBDatabase().then(async (db) => {
    indexedDB.db = db
    const prevIntRes = await getIntResAll(db)
    interceptedResponses = [...prevIntRes, ...interceptedResponses]
    totalResSize += interceptedResponses.reduce((acc, curr) => acc + curr.size, 0)
  })
})
</script>

<main class="max-sm:text-sm pb-4">
  <div class="sticky top-0 p-2 bg-surface max-w-6xl mx-auto mb-2">
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
    <div>
      <p class="mb-2 text-text/50">
        {interceptedResponses.length} Response/s ({sizeToStr(totalResSize)})
      </p>
      <div class="flex gap-2 items-center justify-between text-text/50">
        <Checkbox id="select" class="mr-2"
          checked={selectedResponses.length > 0}
          disabled={interceptedResponses.length < 1}
          onCheckedChange={(checked) => handleSelectAll(checked)}>
          {selectedResponses.length} Selected ({sizeToStr(totalSelSize)})
        </Checkbox>
        <div class="flex gap-1">
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
    </div>
  </div>
  <div class="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1 max-w-5xl mx-auto px-2">
    {#each interceptedResponses as intRes}
      <InterceptionCard interceptedResponse={intRes} selected={setSelRes.has(intRes.id)}
        onSelection={handleSelection} />
    {/each}
  </div>
</main>
