<script lang="ts">
import { Check, ChevronsUp, ChevronsDown, ChevronsUpDown, CopyX } from "@lucide/svelte";
import { Combobox, type WithoutChildrenOrChild } from "bits-ui"

type Props = Combobox.RootProps & {
  items: {
    value: string
    label: string
  }[]
  onresetitems: () => void
  inputProps?: WithoutChildrenOrChild<Combobox.InputProps>
  contentProps?: WithoutChildrenOrChild<Combobox.ContentProps>
};
let {
  items, value = $bindable(), onresetitems, inputProps, contentProps, ...props
}: Props = $props()
let searchValue: string = $state('')
const filteredItems = $derived(
  searchValue === '' ?
  items
  : items.filter((i) => i.label.toLowerCase().includes(searchValue.toLowerCase()))
)

</script>
<Combobox.Root bind:value={value as any} {...props}>
  <div class="inline relative w-fit">
    <Combobox.Input
      oninput={(e) => (searchValue = e.currentTarget.value)}
      class="inline-flex px-4 pr-8 py-2 bg-secondary placeholder:text-text/60 focus:ring-primary focus:outline-hidden min-w-32 truncate rounded-sm"
      aria-label={inputProps?.["aria-label"]} {...inputProps}
    />
    <Combobox.Trigger class="absolute end-3 top-1/2 size-4 -translate-y-1/2">
      <ChevronsUpDown class="text-muted-foreground size-4" />
    </Combobox.Trigger>
  </div>
  <Combobox.Portal>
    <Combobox.Content
      class="bg-secondary outline-hidden z-50 max-h-[min(24em,var(--bits-combobox-content-available-height))] select-none w-[var(--bits-combobox-anchor-width)] min-w-[var(--bits-combobox-anchor-width)] rounded-sm p-2 data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1"
      sideOffset={1} {...contentProps}
    >
      <button
        class="flex gap-1 items-center mb-2 px-2 ml-auto rounded-sm text-sm text-text/60 hover:text-text"
        onclick={onresetitems}
      >
        <CopyX class="size-4" /> Clear
      </button>
      <Combobox.ScrollUpButton
        class="flex w-full items-center justify-center py-1"
      >
        <ChevronsUp class="size-4" />
      </Combobox.ScrollUpButton>
      <Combobox.Viewport>
        {#each filteredItems as item, i (i + item.value)}
          <Combobox.Item
            class="rounded-sm data-highlighted:bg-primary outline-hidden flex w-full select-none items-center p-2 py-1"
            value={item.value}
            label={item.label}
          >
            {#snippet children({ selected })}
              <p class="overflow-hidden overflow-ellipsis w-full whitespace-nowrap">
                {item.label}
              </p>
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
