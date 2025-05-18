
'use client';

import React from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import type { SerializableTrip } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { Briefcase } from 'lucide-react';

interface TripSelectorProps {
  trips: SerializableTrip[];
  currentTripId?: string;
}

export const TripSelector = React.memo(function TripSelector({ trips, currentTripId }: TripSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleTripChange = (tripId: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    if (!tripId) {
      current.delete('tripId');
    } else {
      current.set('tripId', tripId);
    }
    const query = current.toString() ? `?${current.toString()}` : '';
    router.push(`${pathname}${query}`);
  };

  if (trips.length === 0) {
    return <p className="text-center text-muted-foreground">No trips available. An admin needs to create one.</p>;
  }

  return (
    <div className="mb-8 flex flex-col sm:flex-row items-center justify-center gap-4 p-4 bg-card rounded-lg shadow-md">
      <Label htmlFor="trip-select" className="flex items-center text-lg font-medium">
        <Briefcase className="mr-2 h-5 w-5 text-primary" />
        Select Trip:
      </Label>
      <Select onValueChange={handleTripChange} defaultValue={currentTripId || trips[0]?._id}>
        <SelectTrigger id="trip-select" className="w-full sm:w-[300px] text-base py-3">
          <SelectValue placeholder="Select a trip" />
        </SelectTrigger>
        <SelectContent>
          {trips.map((trip) => (
            <SelectItem key={trip._id} value={trip._id} className="text-base py-2">
              {trip.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
});
TripSelector.displayName = 'TripSelector';
