
import { PiggyBank } from 'lucide-react';

interface PageHeaderProps {
    title?: string;
}

export function PageHeader({ title = "Shared Savings Tracker" }: PageHeaderProps) {
  return (
    <header className="mb-8 text-center">
      <div className="inline-flex items-center flex-wrap justify-center gap-3 p-4 bg-card rounded-lg shadow-md">
        <PiggyBank className="h-10 w-10 sm:h-12 sm:w-12 text-primary" />
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-primary">
          {title}
        </h1>
      </div>
      <p className="mt-2 text-lg text-muted-foreground">
        Track your group's contributions towards your next big adventure!
      </p>
    </header>
  );
}
