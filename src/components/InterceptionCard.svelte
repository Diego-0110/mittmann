<script lang="ts">
import type { InterceptedResponse } from "$/types"
import { File, FileAudio, FileImage, FileText, FileVideo } from "@lucide/svelte";
import Button from "./ui/Button.svelte";
import { getIDBDatabase } from "$/services/db";
import { getIntRes } from "$/services/interceptedResponse";

interface Props {
  interceptedResponse: InterceptedResponse
}

const { interceptedResponse: ir }: Props = $props()
let indexedDb: IDBDatabase | null = $state(null)

async function handleDownload () {
  if (indexedDb) {
    const irEx = await getIntRes(indexedDb, ir.id)
    const url = `data:${irEx.contentType};base64,${irEx.content}`
    chrome.downloads.download({ url })
  }
}
$effect(() => {
  getIDBDatabase().then((db) => indexedDb = db)
})
</script>

<section class="border-2 border-outline rounded-sm">
  <div class="p-2 flex justify-center items-center border-b-2 border-outline">
    <span class="p-1 rounded-sm bg-primary ">
      {#if ir.contentType?.includes('image')}
        <FileImage class="size-5" />
      {:else if ir.contentType?.includes('video')}
        <FileVideo class="size-5" />
      {:else if ir.contentType?.includes('audio')}
        <FileAudio class="size-5" />
      {:else if ir.contentType?.includes('text')}
        <FileText class="size-5" />
      {:else}
        <File class="size-5" />
      {/if}
    </span>
  </div>
  <div class="p-1 flex flex-col items-center gap-1">
    <!-- TODO: hover to show complete text -->
    <p class="font-semibold max-w-full whitespace-nowrap overflow-hidden text-ellipsis">
      {ir.name}
    </p>
    <span class="px-2 max-w-full rounded-sm bg-surface-container whitespace-nowrap
      overflow-hidden text-ellipsis">
      {ir.contentType}
    </span>
    <span class="px-2 max-w-full rounded-sm bg-surface-container whitespace-nowrap
      overflow-hidden text-ellipsis">
      {ir.size} Bytes
    </span>
    <Button onclick={handleDownload}>Download</Button>
  </div>
</section>
