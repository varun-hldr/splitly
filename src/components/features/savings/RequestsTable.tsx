
'use client';

import React, { useMemo } from 'react';
import type { SerializableContribution } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ApproveDialog } from './ApproveDialog';
import { DeleteContributionDialog } from './DeleteContributionDialog';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'; 
import { Card, CardContent } from '@/components/ui/card';
import { Inbox, Image as ImageIcon } from 'lucide-react';
import { FormattedDateDisplay } from '@/components/shared/FormattedDateDisplay';

interface RequestsTableProps {
  requests: SerializableContribution[];
  tripName?: string;
  onDelete: (contributionId: string) => Promise<{ success: boolean; message: string }>; // Updated signature
  isTripOwner: boolean; // New prop to control admin actions
}

export const RequestsTable = React.memo(function RequestsTable({ requests, tripName, onDelete, isTripOwner }: RequestsTableProps) {
  const sortedRequests = useMemo(() => {
    return [...requests].sort((a, b) => {
      if (a.status === 'pending' && b.status !== 'pending') return -1;
      if (a.status !== 'pending' && b.status === 'pending') return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [requests]);

  const tableMinHeightForEmptyState = "200px"; 
  const tableScrollHeight = "h-[400px]";

  return (
     <Card className="shadow-lg">
      <CardContent className="pt-6">
        {sortedRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-8" style={{ minHeight: tableMinHeightForEmptyState }}>
            <Inbox className="h-12 w-12 mb-3" />
            <p className="text-lg font-medium">No contribution requests yet for {tripName || 'this trip'}.</p>
            <p>Submitted contributions will appear here.</p>
          </div>
        ) : (
          <ScrollArea className={`${tableScrollHeight} w-full rounded-md border`}>
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-card">
                <TableRow className="bg-muted hover:bg-muted/80 border-b">
                  <TableHead className="whitespace-nowrap">User</TableHead>
                  <TableHead className="text-right whitespace-nowrap">Amount (₹)</TableHead>
                  <TableHead className="whitespace-nowrap">Date</TableHead>
                  <TableHead className="whitespace-nowrap">Status</TableHead>
                  <TableHead className="whitespace-nowrap">Screenshot</TableHead>
                  <TableHead className="text-center min-w-[140px] whitespace-nowrap">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedRequests.map((request) => (
                  <TableRow key={request._id}>
                    <TableCell className="font-medium whitespace-nowrap">{request.username}</TableCell>
                    <TableCell className="text-right whitespace-nowrap">₹{request.amount.toLocaleString()}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      <FormattedDateDisplay dateString={request.createdAt} formatString="PPp" />
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Badge variant={request.status === 'approved' ? 'success' : 'secondary'}>
                        {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <a href={request.screenshotUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                        <ImageIcon className="h-4 w-4" /> View
                      </a>
                    </TableCell>
                    <TableCell className="min-w-[140px]">
                      <div className="flex items-center justify-center space-x-2">
                        {isTripOwner && request.status === 'pending' && (
                          <ApproveDialog 
                            contributionId={request._id} 
                            contributionUser={request.username}
                            contributionAmount={request.amount}
                          />
                        )}
                         {request.status === 'approved' && request.approvedAt && (
                           <span className="text-xs text-muted-foreground whitespace-nowrap text-center">
                             Approved:<br /> <FormattedDateDisplay dateString={request.approvedAt} formatString="PP" />
                           </span>
                        )}
                        {isTripOwner && (
                          <DeleteContributionDialog
                            contributionId={request._id}
                            contributionUser={request.username}
                            onDelete={onDelete}
                          />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
});
RequestsTable.displayName = 'RequestsTable';
