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
    "rounded-sm inline-flex items-center gap-1 px-4 py-2 font-semibold active:scale-[0.98] active:transition-all",
    {
      "bg-primary hover:bg-primary/90 disabled:bg-primary/30": variant === 'primary',
      "bg-secondary hover:bg-secondary/90 disabled:bg-secondary/30": variant === 'secondary',
      "bg-error hover:bg-error/90 disabled:bg-error/30": variant === 'destructive',
      "bg-success hover:bg-success/90 disabled:bg-success/30": variant === 'success',
    }
  )}
  {...props}
>
  {@render children?.()}
</Button.Root>
