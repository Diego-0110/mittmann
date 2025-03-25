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
    "rounded-sm inline-flex gap-1 px-4 py-2 font-bold active:scale-[0.98] active:transition-all",
    {
      "bg-primary hover:bg-primary/90": variant === 'primary',
      "bg-secondary hover:bg-secondary/90": variant === 'secondary',
      "bg-error hover:bg-error/90": variant === 'destructive',
      "bg-success hover:bg-success/90": variant === 'success',
    }
  )}
  {...props}
>
  {@render children?.()}
</Button.Root>
