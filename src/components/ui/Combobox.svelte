<script lang="ts">
import { Check, ChevronsUp, ChevronsDown, ChevronsUpDown } from "@lucide/svelte";
import { Combobox } from "bits-ui"

type Props = {
  options: {
    value: string
    label: string
  }[]
  placeholder?: string
} & Combobox.RootProps
const { options, placeholder = 'Search...', ...props }: Props = $props()
let searchValue: string = $state('')
const filteredOptions = $derived(
  searchValue === '' ?
  options
  : options.filter((o) => o.label.toLowerCase().includes(searchValue.toLowerCase()))
)

</script>
<Combobox.Root {...props}>
  <div class="inline relative w-fit">
    <Combobox.Input
      oninput={(e) => (searchValue = e.currentTarget.value)}
      class="inline-flex px-4 py-2 bg-surface-container placeholder:text-text/60 focus:ring-primary focus:outline-hidden min-w-64 truncate rounded-sm"
      placeholder={placeholder}
      aria-label={placeholder}
    />
    <Combobox.Trigger class="absolute end-3 top-1/2 size-4 -translate-y-1/2">
      <ChevronsUpDown class="text-muted-foreground size-4" />
    </Combobox.Trigger>
  </div>
  <Combobox.Portal>
    <Combobox.Content
      class="bg-surface-container data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 outline-hidden z-50 h-96 max-h-[var(--bits-combobox-content-available-height)] select-none w-[var(--bits-combobox-anchor-width)] min-w-[var(--bits-combobox-anchor-width)] rounded-sm px-4 py-2 data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1"
      sideOffset={2}
    >
      <Combobox.ScrollUpButton
        class="flex w-full items-center justify-center py-1"
      >
        <ChevronsUp class="size-4" />
      </Combobox.ScrollUpButton>
      <Combobox.Viewport class="p-1">
        {#each filteredOptions as opt, i (i + opt.value)}
          <Combobox.Item
            class="rounded-sm data-highlighted:bg-primary outline-hidden flex w-full select-none items-center py-3 pl-5 pr-1.5"
            value={opt.value}
            label={opt.label}
          >
            {#snippet children({ selected })}
              {opt.label}
              {#if selected}
                <div class="ml-auto">
                  <Check class="size-4" />
                </div>
              {/if}
            {/snippet}
          </Combobox.Item>
        {:else}
          <span class="block px-5 py-2 text-sm text-muted-foreground">
            No results found, try again.
          </span>
        {/each}
      </Combobox.Viewport>
      <Combobox.ScrollDownButton
        class="flex w-full items-center justify-center py-1"
      >
        <ChevronsDown class="size-4" />
      </Combobox.ScrollDownButton>
    </Combobox.Content>
  </Combobox.Portal>
</Combobox.Root>
