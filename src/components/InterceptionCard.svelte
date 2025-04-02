<script lang="ts">
import type { InterceptedResponse } from "$/types"
import { File, FileAudio, FileImage, FileText, FileVideo } from "@lucide/svelte";
import { getIDBDatabase } from "$/services/db";
import { responseToDataURL, roundWithPrecision } from "$/utils/misc";
import { cn } from "$/utils/tailwind";
    import { getIntRes } from "$/services/interceptedResponse";

interface Props {
  interceptedResponse: InterceptedResponse
  selected: boolean
  onSelection: (selected: boolean, id: string) => void
}

const { interceptedResponse: ir, selected, onSelection }: Props = $props()
let indexedDb: IDBDatabase | null = $state(null)
let showPreview = $state(false)
let previewContent: null | string = $state(null)

function handleSelection () {
  onSelection(!selected, ir.id)
}
$effect(() => {
  getIDBDatabase().then((db) => indexedDb = db)
})
$effect(() => {
  if (showPreview && indexedDb) {
    getIntRes(indexedDb, ir.id).then((irEx) => {
      if (ir.contentType.includes('image')) {
        previewContent = responseToDataURL(irEx)
      } else {
        previewContent = irEx.content
      }
    })
  }
})
const kb = Math.pow(2, 10)
const mb = Math.pow(2, 20)
</script>

<section class={cn(
  "border-2 border-outline rounded-sm group hover:border-primary/40",
  {
    "!border-primary": selected
  }
)}
  onclick={handleSelection} onkeydown={handleSelection}
  role="button" tabindex="0">
  <div class={cn(
    "p-2 flex justify-center items-center border-b-2 border-outline group-hover:border-primary/40",
    {
      "!border-primary": selected
    }
  )}>
    <button class="p-1 rounded-sm bg-primary hover:cursor-pointer"
      onclick={(evt) => { evt.stopPropagation(); showPreview = true; }}>
      {#if ir.contentType.includes('image')}
        <FileImage class="size-6" />
      {:else if ir.contentType.includes('video')}
        <FileVideo class="size-6" />
      {:else if ir.contentType.includes('audio')}
        <FileAudio class="size-6" />
      {:else if ir.contentType.includes('text')}
        <FileText class="size-6" />
      {:else}
        <File class="size-6" />
      {/if}
    </button>
    <div tabindex="0" role="button" hidden={!showPreview}
      onclick={(evt) => { evt.stopPropagation(); showPreview = false; }}
      onkeydown={(evt) => { evt.stopPropagation(); showPreview = false; }}
      class="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center p-2 bg-surface/60">
      {#if previewContent}
        <div class="p-2 w-full h-[min(100%,24em)] flex items-center justify-center bg-surface-container rounded-sm">
          {#if ir.contentType.includes('image')}
            <img src={previewContent} alt="Preview">
          {:else}
            <p class="overflow-y-auto overflow-x-hidden break-words">
              <code>
                {previewContent}
              </code>
            </p>
          {/if}
        </div>
      {:else}
        Loading...
      {/if}
    </div>
  </div>
  <div class="p-2 flex flex-col items-center gap-1">
    <!-- TODO: hover to show complete text -->
    <p class="font-semibold max-w-full whitespace-nowrap overflow-hidden text-ellipsis">
      {ir.name}
    </p>
    <span class="px-2 max-w-full rounded-sm text-sm bg-surface-container whitespace-nowrap
      overflow-hidden text-ellipsis">
      {ir.contentType.split(';')[0]}
    </span>

    <span class="px-2 max-w-full rounded-sm text-sm bg-surface-container whitespace-nowrap
      overflow-hidden text-ellipsis">
      {#if ir.size >= mb}
        {roundWithPrecision(ir.size / mb, 2)} MB
      {:else if ir.size >= kb}
        {roundWithPrecision(ir.size / kb, 2)} KB
      {:else}
        {ir.size} Bytes
      {/if}
    </span>
  </div>
</section>
