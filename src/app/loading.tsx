
import { Loader2 } from "lucide-react";

export default function Loading() {
  // This UI will be shown during navigation between server components
  // or when server components are fetching data.
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-background/80 backdrop-blur-sm" aria-live="polite" aria-busy="true">
      <Loader2 className="h-16 w-16 animate-spin text-primary" />
      <span className="sr-only">Loading page content...</span>
    </div>
  );
}
