<script lang="ts">
import Button from "./ui/Button.svelte";
import Checkbox from "./ui/Checkbox.svelte";
import { Download, Trash2 } from "@lucide/svelte";
import { indexedDBState as indexedDB } from "$/states/indexedDB.svelte";
import { SvelteSet } from "svelte/reactivity";
import mime from 'mime-types'
import { deleteAll, deleteCapRes, getCapRes } from "$/services/capturedResponse";
import { responseToDataURL, sizeToStr } from "$/utils/misc";
import type { CapturedResponse } from "$/types";


interface Props {
  responses: CapturedResponse[]
  selectedResponses: string[]
  selResponsesSet: SvelteSet<string>
  totalResSize: number
  totalSelSize: number
}
let {
  responses = $bindable(),
  selectedResponses = $bindable(),
  selResponsesSet = $bindable(),
  totalResSize = $bindable(),
  totalSelSize = $bindable()
}: Props = $props()


async function handleDownload () {
  if (indexedDB.db) {
    // Get every selected response from database
    for (let i = 0; i < selectedResponses.length; i++) {
      const rId = selectedResponses[i]
      const rEx = await getCapRes(indexedDB.db, rId)
      // Sometimes the name of the resource has already an extension
      // This extension can or cannot be suitable for the content type
      const hasExt = mime.extensions[rEx.contentType.split(';')[0]]?.some(
        (e) => rEx.name.endsWith(`.${e}`))
      // Default value for the given content type
      const defExt = mime.extension(rEx.contentType)
      // Maybe name is ''
      let filename = rEx.name || 'download' // default value
      // Use default extension when name doesn't have a valid one
      if (!hasExt && defExt) {
        filename += `.${defExt}`
      }
      // Download the response content as a file
      // Some characters are not valid for a filename
      chrome.downloads.download({
        url: responseToDataURL(rEx),
        filename: filename?.replace(/[/\\?%*:|"<>]/g, '')
      })
    }
  }
}

async function handleDelete () {
  // First delete from database to avoid loase the selected responses
  if (indexedDB.db) {
    for (let i = 0; i < selectedResponses.length; i++) {
      const rId = selectedResponses[i]
      await deleteCapRes(indexedDB.db, rId)
    }
  }
  responses = responses.filter((r) => !selResponsesSet.has(r.id))
  selectedResponses = []
  selResponsesSet.clear()
  totalResSize -= totalSelSize
  totalSelSize = 0
}

async function handleDeleteAll () {
  responses = []
  selectedResponses = []
  selResponsesSet.clear()
  totalResSize = 0
  totalSelSize = 0
  if (indexedDB.db) {
    await deleteAll(indexedDB.db)
  }
}

function handleSelectAll (selected: boolean) {
  // selected: new current state
  if (selected) {
    selectedResponses = [...responses.map((r) => r.id)]
    responses.forEach((r) => selResponsesSet.add(r.id))
    totalSelSize = totalResSize
  } else {
    selectedResponses = []
    selResponsesSet.clear()
    totalSelSize = 0
  }
}

</script>
<div class="space-y-1">
  <div class="flex gap-2 items-center justify-between">
    <p class="text-text/60">
      {responses.length} Response/s ({sizeToStr(totalResSize)})
    </p>
    <Button onclick={handleDeleteAll} variant="secondary">
      <Trash2 class="size-4" />Discard All
    </Button>
  </div>
  <div class="flex gap-2 items-center justify-between text-text/60">
    <Checkbox id="select" class="mr-2"
      checked={selectedResponses.length > 0}
      disabled={responses.length < 1}
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
