import { LoaderCircle, type LucideProps } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Minimal loading spinner — an `animate-spin` wrapper around lucide's
 * `LoaderCircle`. Exposes `role="status"` so assistive tech announces it and
 * tests can query it. Used by `Button`'s `loading` state.
 */
function Spinner({ className, ...props }: LucideProps) {
  return (
    <LoaderCircle
      aria-label="Loading"
      className={cn('animate-spin', className)}
      data-slot="spinner"
      role="status"
      {...props}
    />
  );
}

export { Spinner };
