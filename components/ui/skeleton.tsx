import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn("animate-pulse rounded-md bg-slate-200 dark:bg-slate-800 inline-block", className)}
      {...props}
    />
  );
}

export { Skeleton };
