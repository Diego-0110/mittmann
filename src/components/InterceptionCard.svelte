<script lang="ts">
import type { InterceptedResponse } from "$/types"
import { File, FileAudio, FileImage, FileText, FileVideo } from "@lucide/svelte";
import { getIDBDatabase } from "$/services/db";
import { roundWithPrecision } from "$/utils/misc";
import { cn } from "$/utils/tailwind";

interface Props {
  interceptedResponse: InterceptedResponse
  selected: boolean
  onSelection: (selected: boolean, id: string) => void
}

const { interceptedResponse: ir, selected, onSelection }: Props = $props()
let indexedDb: IDBDatabase | null = $state(null)

function handleSelection () {
  onSelection(!selected, ir.id)
}
$effect(() => {
  getIDBDatabase().then((db) => indexedDb = db)
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
    <span class="p-1 rounded-sm bg-primary">
      {#if ir.contentType?.includes('image')}
        <FileImage class="size-6" />
      {:else if ir.contentType?.includes('video')}
        <FileVideo class="size-6" />
      {:else if ir.contentType?.includes('audio')}
        <FileAudio class="size-6" />
      {:else if ir.contentType?.includes('text')}
        <FileText class="size-6" />
      {:else}
        <File class="size-6" />
      {/if}
    </span>
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
