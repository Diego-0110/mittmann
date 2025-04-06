<script lang="ts">
import CaptureOptsPanel from "./components/CaptureOptsPanel.svelte";
import CaptureActionsPanel from "./components/CaptureActionsPanel.svelte";
import CaptureCard from "$/components/CaptureCard.svelte";
import { getIDBDatabase } from "$/services/db";
import { addCapRes, getCapResAll } from "$/services/capturedResponse";
import { SvelteSet } from "svelte/reactivity";
import mime from "mime-types";
import type { CapturedResponse, CaptureOptions } from "$/types"
// Global state for indexedDB reference
import { indexedDBState as indexedDB } from "$/states/indexedDB.svelte";


// This states are bind to CaptureOptsPanel/CaptureActionsPanel
// Options related to capture responses
let captureOptions: CaptureOptions = $state({
  activated: false,
  mimeTypes: []
})
let capturedResponses: CapturedResponse[] = $state([])
// Sub array of capturedResponses with the ids of the responses selected by the user
let selectedResponses: string[] = $state([])
// Set version of selectedResponses to optimize some operations
let selResponsesSet: SvelteSet<string> = $state(new SvelteSet())
// Total sum of the size of every captured/selected response
let totalResSize = $state(0)
let totalSelSize = $state(0)


// Add an event listener to execute when a request has finished (the response was received)
chrome.devtools.network.onRequestFinished.addListener((inRequest) => {
  // Ignore event when capture is not activated
  if (!captureOptions.activated) {
    return
  }
  // inRequest type is not well defined
  const devRequest = inRequest as chrome.devtools.network.Request & {
    response: Response & { content: { mimeType: string, size: number },
      headers: { name: string, value: string }[] }
    request: Request
  }

  // Get content type without enconding
  let contentType = devRequest.response.content.mimeType as string
  // Sometimes mimeType has the 'x-unknown' value, even when the content type is not that value
  // When this happens, we use the header 'content-type' value (without the charset value)
  const headerContentType = devRequest.response.headers.find((h) => h.name === 'content-type')
  contentType = contentType !== 'x-unknown' || !headerContentType?.value ? contentType
    : headerContentType?.value.split(';')[0]

  // Knowing the content type, check if the request should be captured
  if (captureOptions.mimeTypes.length > 0 && !captureOptions.mimeTypes.includes(contentType)) {
    return
  }

  // The last part of the url is the name of the resource
  const name = new URL(devRequest.request.url).pathname.split('/').slice(-1)[0]

  // Use getContent function to received the response content and enconding in a callback
  devRequest.getContent(async (content, defEncoding) => {
    // Some response don't have content and should be ignored
    if (!content) {
      return
    }
    // defEncoding can be undefined, so we try to search for the default charset of the used
    // content type (mime.charset() can return false)
    const encoding = defEncoding || mime.charset(contentType) || undefined
    const size = devRequest.response.content.size

    const newCapturedResponse: CapturedResponse = {
      // Used to identify the response locally and in the indexedDB
      id: self.crypto.randomUUID(),
      // Add the charset value, only when the enconding is defined or is not 'base64'
      contentType: encoding && encoding !== 'base64'?
        `${contentType};charset=${encoding.toLowerCase()}`: contentType,
      encoding,
      name,
      size
    }

    // Update states
    capturedResponses = [...capturedResponses, newCapturedResponse]
    totalResSize += size
    // Update database
    if (indexedDB.db) {
      addCapRes(indexedDB.db, {
        ...newCapturedResponse,
        content,
      })
    }
  })
})


function handleSelection (selected: boolean, cr: CapturedResponse) {
  // selected: new state
  if (selected) {
    selectedResponses = [...selectedResponses, cr.id]
    selResponsesSet.add(cr.id)
    totalSelSize += cr.size
  } else {
    selectedResponses = selectedResponses.filter((sid) => sid !== cr.id)
    selResponsesSet.delete(cr.id)
    totalSelSize -= cr.size
  }
}


$effect(() => {
  // Reload from indexedDB the captured responses
  getIDBDatabase().then(async (db) => {
    indexedDB.db = db
    const prevRes = await getCapResAll(db)
    // Update states
    capturedResponses = [...prevRes, ...capturedResponses]
    totalResSize += capturedResponses.reduce((acc, curr) => acc + curr.size, 0)
  })
})
</script>

<main class="max-sm:text-sm pb-4">
  <div class="sticky top-0 p-2 bg-surface max-w-6xl mx-auto mb-2">
    <CaptureOptsPanel bind:opts={captureOptions} class="mb-2" />
    <CaptureActionsPanel
      bind:responses={capturedResponses} bind:selectedResponses={selectedResponses}
      bind:selResponsesSet={selResponsesSet} bind:totalResSize={totalResSize}
      bind:totalSelSize={totalSelSize} />
  </div>
  <div class="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1 max-w-5xl mx-auto px-2">
    {#each capturedResponses as capRes}
      <CaptureCard response={capRes} selected={selResponsesSet.has(capRes.id)}
        onSelection={handleSelection} />
    {/each}
  </div>
</main>
