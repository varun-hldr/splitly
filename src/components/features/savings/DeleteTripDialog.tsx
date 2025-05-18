
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
import { Trash2, Loader2, ShieldAlert } from 'lucide-react';
import { deleteTrip } from '@/lib/actions'; // Server action handles auth

interface DeleteTripDialogProps {
  tripId: string;
  tripName: string;
}

export function DeleteTripDialog({ tripId, tripName }: DeleteTripDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    setIsDeleting(true);
    // Admin secret removed, server action handles authorization
    const result = await deleteTrip(tripId); 
    setIsDeleting(false);

    if (result.success) {
      toast({
        title: 'Success!',
        description: result.message,
      });
      setIsOpen(false); 
    } else {
      toast({
        title: 'Error',
        description: result.message || 'Failed to delete trip.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="mr-2 h-4 w-4" /> Delete
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <ShieldAlert className="mr-2 h-5 w-5 text-destructive" /> Confirm Trip Deletion
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the trip <strong>{tripName}</strong>? 
            This action will delete the trip and ALL its contributions. This cannot be undone.
            {/* Admin secret description removed */}
          </DialogDescription>
        </DialogHeader>
        {/* Admin secret input field removed */}
        <DialogFooter className="pt-4"> {/* Added padding top for spacing */}
          <DialogClose asChild>
            <Button variant="outline" disabled={isDeleting}>Cancel</Button>
          </DialogClose>
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
            Delete Trip Permanently
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
