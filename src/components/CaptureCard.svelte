<script lang="ts">
import type { CapturedResponse } from "$/types"
import { File, FileAudio, FileImage, FileText, FileType, FileVideo } from "@lucide/svelte";
import { sizeToStr } from "$/utils/misc";
import { cn } from "$/utils/tailwind";
import CapturePreview from "./CapturePreview.svelte";

interface Props {
  response: CapturedResponse
  selected: boolean
  onSelection: (selected: boolean, cr: CapturedResponse) => void
}

const { response, selected, onSelection }: Props = $props()
let showPreview = $state(false)

function handleSelection () {
  onSelection(!selected, response)
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
      {#if response.contentType.includes('image')}
        <FileImage class="size-6" />
      {:else if response.contentType.includes('video')}
        <FileVideo class="size-6" />
      {:else if response.contentType.includes('audio')}
        <FileAudio class="size-6" />
      {:else if response.contentType.includes('text')}
        <FileText class="size-6" />
      {:else if response.contentType.includes('font')}
        <FileType class="size-6" />
      {:else}
        <File class="size-6" />
      {/if}
    </button>
    <CapturePreview show={showPreview} response={response}
      onClose={handleClosePreview} />
  </div>
  <div class="p-2 flex flex-col items-center gap-1">
    <p class="font-semibold max-w-full whitespace-nowrap overflow-hidden text-ellipsis">
      {response.name}
    </p>
    <span class="px-2 max-w-full rounded-sm text-sm bg-surface-container whitespace-nowrap
      overflow-hidden text-ellipsis">
      {response.contentType.split(';')[0]}
    </span>

    <span class="px-2 max-w-full rounded-sm text-sm bg-surface-container whitespace-nowrap
      overflow-hidden text-ellipsis">
      {sizeToStr(response.size)}
    </span>
  </div>
</section>
