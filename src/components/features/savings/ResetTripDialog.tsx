
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
// import { Input } from '@/components/ui/input'; // No longer needed
// import { Label } from '@/components/ui/label'; // No longer needed
import { useToast } from '@/hooks/use-toast';
import { RotateCcw, Loader2, ShieldAlert } from 'lucide-react';
import { resetTrip } from '@/lib/actions'; // Server action handles auth

interface ResetTripDialogProps {
  tripId: string;
  tripName: string;
}

export function ResetTripDialog({ tripId, tripName }: ResetTripDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const { toast } = useToast();

  const handleReset = async () => {
    setIsResetting(true);
    // Admin secret removed, server action handles authorization
    const result = await resetTrip(tripId);
    setIsResetting(false);

    if (result.success) {
      toast({
        title: 'Success!',
        description: result.message,
      });
      setIsOpen(false);
    } else {
      toast({
        title: 'Error',
        description: result.message || 'Failed to reset trip.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <RotateCcw className="mr-2 h-4 w-4" /> Reset
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <ShieldAlert className="mr-2 h-5 w-5 text-destructive" /> Confirm Trip Reset
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to reset the trip <strong>{tripName}</strong>? 
            This action will delete ALL contributions associated with this trip, but the trip itself will remain. This cannot be undone.
            {/* Admin secret description removed */}
          </DialogDescription>
        </DialogHeader>
        {/* Admin secret input field removed */}
        <DialogFooter className="pt-4"> {/* Added padding top for spacing */}
          <DialogClose asChild>
            <Button variant="outline" disabled={isResetting}>Cancel</Button>
          </DialogClose>
          <Button type="button" variant="destructive" onClick={handleReset} disabled={isResetting}>
            {isResetting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RotateCcw className="mr-2 h-4 w-4" />}
            Reset Trip Contributions
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
