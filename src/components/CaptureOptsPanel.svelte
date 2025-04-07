<script lang="ts">
import Button from "$/components/ui/Button.svelte";
import Combobox from "$/components/ui/Combobox.svelte";
import { CirclePlay, StopCircle } from "@lucide/svelte";
import mime from "mime-types";
import type { CaptureOptions } from "$/types"
import { cn } from "$/utils/tailwind";

// Constant use in MIME type combobox
const CONTENT_TYPES = [...new Set(Object.values(mime.types).sort()).values()]
.map((c) => ({ value: c, label: c }))

interface Props {
  opts: CaptureOptions
  class?: string
}
let { opts = $bindable(), class: className }: Props = $props()

</script>

<div class={cn(
  "mb-1 flex flex-wrap gap-1 items-center",
  className
)}>
  <Button onclick={() => opts.activated = !opts.activated }
    variant={opts.activated? 'destructive' : 'primary'}>
    {#if opts.activated}
      <StopCircle class="size-4" />Stop
    {:else}
      <CirclePlay class="size-4" />Capture
    {/if}
  </Button>
  <Combobox items={CONTENT_TYPES} bind:value={opts.mimeTypes}
    inputProps={{ placeholder: 'MIME Type' }} type="multiple"
    onresetitems={() => (opts.mimeTypes = [])}
  />
</div>
