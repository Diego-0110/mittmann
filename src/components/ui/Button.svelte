<script lang="ts">
import { Button } from "bits-ui"
import { cn } from "$/utils/tailwind"
type Props = {
  variant?: 'primary' | 'secondary' | 'destructive' | 'success'
} & Button.RootProps
const { children, variant = 'primary', class: className, ...props }: Props = $props()
</script>

<Button.Root
  class={cn(
    "rounded-sm inline-flex items-center gap-1 px-4 py-2 font-medium text-text active:scale-[0.98] active:transition-all disabled:opacity-30 not-disabled:cursor-pointer",
    {
      "bg-primary hover:not-disabled:bg-primary/90": variant === 'primary',
      "bg-secondary hover:not-disabled:bg-secondary/90": variant === 'secondary',
      "bg-error hover:not-disabled:bg-error/90": variant === 'destructive',
      "bg-success hover:not-disabled:bg-success/90": variant === 'success',
    }, className
  )}
  {...props}
>
  {@render children?.()}
</Button.Root>
