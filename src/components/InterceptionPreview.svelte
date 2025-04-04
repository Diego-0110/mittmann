<script lang="ts">
import { indexedDBState as indexedDB } from "$/states/indexedDB.svelte"
import type { InterceptedResponse } from "$/types";
import { getIntRes } from "$/services/interceptedResponse"
import { responseToDataURL, isImageType, hasPreview } from "$/utils/misc"

interface Props {
  interceptedResponse: InterceptedResponse
  show: boolean
  onClose: (evt: MouseEvent | KeyboardEvent) => void
}
let previewContent: null | string = $state(null)

const { show, onClose, interceptedResponse: ir }: Props = $props()

$effect(() => {
  if (show && indexedDB.db) {
    if (!hasPreview(ir.contentType)) {
      previewContent = 'No preview.'
      return
    }
    getIntRes(indexedDB.db, ir.id).then((irEx) => {
      if (isImageType(ir.contentType)) {
        previewContent = responseToDataURL(irEx)
      } else {
        previewContent = irEx.content
      }
    })
  }
})
</script>
<div tabindex="0" role="button" hidden={!show}
  onclick={onClose} onkeydown={onClose}
  class="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center p-4 bg-surface/60">
  {#if previewContent}
    <div class="p-4 w-[min(100%,var(--container-2xl))] max-h-full overflow-auto bg-surface-container rounded-sm">
      <p class="mb-2 font-semibold text-center max-w-full whitespace-nowrap overflow-hidden text-ellipsis">
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
