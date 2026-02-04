import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold">
        DB
      </div>
       <span className="font-bold text-lg text-foreground group-data-[collapsible=icon]:hidden whitespace-nowrap">Dulus Business Hub</span>
    </div>
  );
}
