<script lang="ts">
import type { InterceptedResponse } from "$/types"
import { File, FileAudio, FileImage, FileText, FileType, FileVideo } from "@lucide/svelte";
import { sizeToStr } from "$/utils/misc";
import { cn } from "$/utils/tailwind";
import InterceptionPreview from "./InterceptionPreview.svelte";

interface Props {
  interceptedResponse: InterceptedResponse
  selected: boolean
  onSelection: (selected: boolean, ir: InterceptedResponse) => void
}

const { interceptedResponse: ir, selected, onSelection }: Props = $props()
let showPreview = $state(false)

function handleSelection () {
  onSelection(!selected, ir)
}
function handleClosePreview (evt: MouseEvent | KeyboardEvent) {
  evt.stopPropagation()
  if (evt.target === evt.currentTarget) {
    showPreview = false
  }
}
function handleOpenPreview (evt: MouseEvent) {
  evt.stopPropagation()
  showPreview = true
}
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
      onclick={handleOpenPreview}>
      {#if ir.contentType.includes('image')}
        <FileImage class="size-6" />
      {:else if ir.contentType.includes('video')}
        <FileVideo class="size-6" />
      {:else if ir.contentType.includes('audio')}
        <FileAudio class="size-6" />
      {:else if ir.contentType.includes('text')}
        <FileText class="size-6" />
      {:else if ir.contentType.includes('font')}
        <FileType class="size-6" />
      {:else}
        <File class="size-6" />
      {/if}
    </button>
    <InterceptionPreview show={showPreview} interceptedResponse={ir}
      onClose={handleClosePreview} />
  </div>
  <div class="p-2 flex flex-col items-center gap-1">
    <p class="font-semibold max-w-full whitespace-nowrap overflow-hidden text-ellipsis">
      {ir.name}
    </p>
    <span class="px-2 max-w-full rounded-sm text-sm bg-surface-container whitespace-nowrap
      overflow-hidden text-ellipsis">
      {ir.contentType.split(';')[0]}
    </span>

    <span class="px-2 max-w-full rounded-sm text-sm bg-surface-container whitespace-nowrap
      overflow-hidden text-ellipsis">
      {sizeToStr(ir.size)}
    </span>
  </div>
</section>
