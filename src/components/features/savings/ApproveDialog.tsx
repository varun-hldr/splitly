
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
// import { Input } from '@/components/ui/input'; // No longer needed for admin secret
// import { Label } from '@/components/ui/label'; // No longer needed
import { approveContribution } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { ShieldCheck, Loader2 } from 'lucide-react';

interface ApproveDialogProps {
  contributionId: string;
  contributionUser: string;
  contributionAmount: number;
}

export function ApproveDialog({ contributionId, contributionUser, contributionAmount }: ApproveDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const { toast } = useToast();

  const handleApprove = async () => {
    setIsApproving(true);
    // Admin secret removed, server action handles authorization
    const result = await approveContribution(contributionId);
    setIsApproving(false);

    if (result.success) {
      toast({
        title: 'Success!',
        description: result.message,
      });
      setIsOpen(false);
    } else {
      toast({
        title: 'Error',
        description: result.message || 'Failed to approve contribution.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm">
          <ShieldCheck className="mr-2 h-4 w-4" /> Approve
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Approve Contribution</DialogTitle>
          <DialogDescription>
            Approve contribution from <strong>{contributionUser}</strong> for <strong>₹{contributionAmount.toLocaleString()}</strong>.
            {/* Admin secret description removed */}
          </DialogDescription>
        </DialogHeader>
        {/* Admin secret input field removed */}
        <DialogFooter className="pt-4"> {/* Added padding top for spacing */}
          <DialogClose asChild>
             <Button variant="outline" disabled={isApproving}>Cancel</Button>
          </DialogClose>
          <Button variant="default" type="button" onClick={handleApprove} disabled={isApproving}>
            {isApproving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
            Confirm Approval
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
