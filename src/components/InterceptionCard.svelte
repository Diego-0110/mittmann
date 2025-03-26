<script lang="ts">
import type { InterceptedResponse } from "$/types"
import { File } from "@lucide/svelte";
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
      <File class="size-5" />
    </span>
  </div>
  <div class="p-1 flex flex-col items-center gap-1">
    <span class="px-2 rounded-sm bg-slate-700">{ir.contentType}</span>
    <Button onclick={handleDownload}>Download</Button>
  </div>
</section>
