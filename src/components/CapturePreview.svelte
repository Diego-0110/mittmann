<script lang="ts">
import { indexedDBState as indexedDB } from "$/states/indexedDB.svelte"
import type { CapturedResponse } from "$/types";
import { getCapRes } from "$/services/capturedResponse"
import { responseToDataURL, isImageType, hasPreview } from "$/utils/misc"

interface Props {
  response: CapturedResponse
  show: boolean
  onClose: (evt: MouseEvent | KeyboardEvent) => void
}
let previewContent: null | string = $state(null)

const { show, onClose, response }: Props = $props()

$effect(() => {
  if (show && indexedDB.db) {
    // Show preview only when is a text or image type
    if (!hasPreview(response.contentType)) {
      previewContent = 'No preview.'
      return
    }
    // Get from database the complete data of the response
    getCapRes(indexedDB.db, response.id).then((responseEx) => {
      if (isImageType(response.contentType)) {
        previewContent = responseToDataURL(responseEx)
      } else {
        previewContent = responseEx.content
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
        {response.name}
      </p>
      {#if isImageType(response.contentType)}
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
