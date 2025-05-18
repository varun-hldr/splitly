
import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { CreateTripForm } from '@/components/features/savings/CreateTripForm';
import { getAllTripsForCurrentUser } from '@/lib/actions';
import type { SerializableTrip } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FormattedDateDisplay } from '@/components/shared/FormattedDateDisplay';
import { DeleteTripDialog } from '@/components/features/savings/DeleteTripDialog';
import { ResetTripDialog } from '@/components/features/savings/ResetTripDialog';
import { LandingPageHeader } from '@/components/layout/LandingPageHeader';
import { Separator } from '@/components/ui/separator';
import { ClientOnlyCurrentYear } from '@/components/shared/CurrentYear';
import { ListOrdered, Eye, PlusCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';


export default async function ManageTripsPage() {
  const session = await getSession();
  const user = session?.user;

  if (!user) {
    redirect('/api/auth/login?returnTo=/manage-trips');
  }

  const dbTrips = await getAllTripsForCurrentUser(); // This will now fetch only user's trips
  const serializableTrips: SerializableTrip[] = dbTrips.map(trip => ({
    _id: trip._id.toString(),
    userId: trip.userId,
    userEmail: trip.userEmail,
    name: trip.name,
    description: trip.description ?? undefined,
    goalAmount: trip.goalAmount ?? undefined,
    upiId: trip.upiId ?? undefined,
    qrCodeImageUrl: trip.qrCodeImageUrl ?? undefined,
    createdAt: trip.createdAt.toISOString(),
  }));

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <LandingPageHeader />
      <main className="flex-grow container mx-auto px-4 py-8">
        <section id="create-trip" className="mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold mb-2 text-primary text-center flex items-center justify-center">
            <PlusCircle className="mr-3 h-8 w-8" />
            Create New Savings Trip
          </h2>
          <p className="text-muted-foreground text-center mb-6">
            Define a new savings goal for your group, including optional payment details.
          </p>
          <CreateTripForm />
        </section>

        <Separator className="my-16" />

        <section id="manage-trips" className="mb-12">
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-3xl md:text-4xl flex items-center">
                <ListOrdered className="mr-3 h-8 w-8 text-primary" />
                Manage Your Trips
              </CardTitle>
              <CardDescription className="mt-2">
                View, reset, or delete your existing savings trips. Resetting removes all contributions. Deleting removes the trip and contributions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {serializableTrips.length === 0 ? (
                <Alert variant="default" className="border-primary/30 text-primary">
                  <Info className="h-4 w-4 !text-primary" />
                  <AlertTitle>No Trips Created Yet!</AlertTitle>
                  <AlertDescription>
                    You haven't created any savings trips. Use the form above to create your first one.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="whitespace-nowrap">Trip Name</TableHead>
                        <TableHead className="whitespace-nowrap">Created At</TableHead>
                        <TableHead className="text-right whitespace-nowrap">Goal (₹)</TableHead>
                        <TableHead className="text-center min-w-[240px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {serializableTrips.map((trip) => (
                        <TableRow key={trip._id}>
                          <TableCell className="font-medium whitespace-nowrap">{trip.name}</TableCell>
                          <TableCell className="whitespace-nowrap">
                            <FormattedDateDisplay dateString={trip.createdAt} formatString="PP" />
                          </TableCell>
                          <TableCell className="text-right whitespace-nowrap">
                            {trip.goalAmount ? trip.goalAmount.toLocaleString() : '-'}
                          </TableCell>
                          <TableCell className="min-w-[240px]">
                            <div className="flex items-center justify-center space-x-2">
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/trips?tripId=${trip._id}`}>
                                  <Eye className="mr-2 h-4 w-4" /> View
                                </Link>
                              </Button>
                              <ResetTripDialog tripId={trip._id} tripName={trip.name} />
                              <DeleteTripDialog tripId={trip._id} tripName={trip.name} />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </main>
      <footer className="text-center py-8 border-t mt-12 bg-muted/50">
        <p className="text-sm text-muted-foreground">
          Shared Savings Tracker &copy; <ClientOnlyCurrentYear />. All rights reserved.
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Making group savings simple and transparent.
        </p>
      </footer>
    </div>
  );
}

export const dynamic = 'force-dynamic';

    