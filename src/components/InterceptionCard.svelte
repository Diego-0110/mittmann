<script lang="ts">
import type { InterceptedResponse } from "$/types"
import { File, FileAudio, FileImage, FileText, FileType, FileVideo } from "@lucide/svelte";
import { getIDBDatabase } from "$/services/db";
import { responseToDataURL, sizeToStr } from "$/utils/misc";
import { cn } from "$/utils/tailwind";
import { getIntRes } from "$/services/interceptedResponse";

interface Props {
  interceptedResponse: InterceptedResponse
  selected: boolean
  onSelection: (selected: boolean, ir: InterceptedResponse) => void
}

const { interceptedResponse: ir, selected, onSelection }: Props = $props()
let indexedDb: IDBDatabase | null = $state(null)
let showPreview = $state(false)
let previewContent: null | string = $state(null)

function handleSelection () {
  onSelection(!selected, ir)
  console.log(ir.id, ir.name, ir.contentType)
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
function isImageType (contentType: string) {
  return contentType.includes('image')
}
function isTextType (contentType: string) {
  return contentType.includes('text') || contentType.includes('css') ||
    contentType.includes('html') || contentType.includes('xml') ||
    contentType.includes('javascript') || contentType.includes('json')
}
function hasPreview (contentType: string) {
  return isImageType(contentType) || isTextType(contentType)
}
$effect(() => {
  getIDBDatabase().then((db) => indexedDb = db)
})
$effect(() => {
  if (showPreview && indexedDb) {
    if (!hasPreview(ir.contentType)) {
      previewContent = 'No preview.'
      return
    }
    getIntRes(indexedDb, ir.id).then((irEx) => {
      if (isImageType(ir.contentType)) {
        previewContent = responseToDataURL(irEx)
      } else {
        previewContent = irEx.content
      }
    })
  }
})
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
    <div tabindex="0" role="button" hidden={!showPreview}
      onclick={handleClosePreview} onkeydown={handleClosePreview}
      class="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center p-4 bg-surface/60">
      {#if previewContent}
        <div class="p-4 w-[min(100%,var(--container-2xl))] max-h-full overflow-auto bg-surface-container rounded-sm">
          <p class="font-semibold text-center max-w-full whitespace-nowrap overflow-hidden text-ellipsis">
            {ir.name}
          </p>
          {#if isImageType(ir.contentType)}
            <div class="h-96">
              <img src={previewContent} alt="Preview" class="w-full h-full object-scale-down">
            </div>
          {:else}
            <p class="h-96 max-w-full overflow-y-auto overflow-x-hidden break-words text-text/70">
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
      {sizeToStr(ir.size)}
    </span>
  </div>
</section>
