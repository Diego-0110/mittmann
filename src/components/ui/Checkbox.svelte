<script lang="ts">
import { Checkbox, Label } from "bits-ui";
import { Check, Minus } from "@lucide/svelte";
import type { Snippet } from "svelte";
import { cn } from "$/utils/tailwind";

type Props = { children: Snippet, class?: string } & Checkbox.RootProps

const { children, class: className, ...props }: Props = $props()

</script>
<div class={cn(
  "flex items-center gap-2 text-sm",
  className
)}>
  <Checkbox.Root
    class="border-2 border-primary bg-primary data-[state=unchecked]:border-secondary data-[state=unchecked]:bg-transparent data-[state=unchecked]:hover:not-disabled:border-primary peer inline-flex size-5 items-center justify-center rounded-md transition-all duration-150 ease-in-out active:scale-[0.98] hover:not-disabled:cursor-pointer"
    {...props}
  >
    {#snippet children({ checked, indeterminate })}
      <div class="text-text inline-flex items-center justify-center">
        {#if checked}
          <Check class="size-3" />
        {:else if indeterminate}
          <Minus class="size-3" />
        {/if}
      </div>
    {/snippet}
  </Checkbox.Root>
  <Label.Root
    for={props.id}
  >
    {@render children()}
  </Label.Root>
</div>
