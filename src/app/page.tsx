
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Eye, Users, Activity, ShieldCheck, Settings2, QrCode, Rocket, LogIn, ListChecks, Route } from 'lucide-react';
import { ClientOnlyCurrentYear } from '@/components/shared/CurrentYear';
import { getRecentPublicTrips } from '@/lib/actions';
import type { SerializableTrip } from '@/types';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FormattedDateDisplay } from '@/components/shared/FormattedDateDisplay';
import { LandingPageHeader } from '@/components/layout/LandingPageHeader';
import { getSession } from '@auth0/nextjs-auth0';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

const features = [
  {
    icon: Settings2,
    title: "Easy Trip Setup",
    description: "Users can quickly create new savings goals for any group adventure or project, complete with payment details.",
  },
  {
    icon: Users,
    title: "Transparent Contributions",
    description: "Track contributions from all members with clear status updates and payment proof submission.",
  },
  {
    icon: QrCode,
    title: "Secure QR & UPI Payments",
    description: "Provide secure and easy payment options like UPI ID and QR codes, unique for each trip.",
  },
  {
    icon: Activity,
    title: "Progress Monitoring",
    description: "Visualize savings progress with clear stats, charts, and goal tracking for each trip.",
  },
  {
    icon: ShieldCheck,
    title: "Owner Controls",
    description: "Trip owners can manage trips, approve contributions, reset trip data, or delete trips as needed.",
  },
  {
    icon: Rocket,
    title: "Get Started Quickly",
    description: "Simple interface to get your group saving in no time. Focus on the fun, let us handle the tracking!",
  }
];

export default async function HomePage() {
  const session = await getSession();
  const user = session?.user;

  const recentPublicTrips = await getRecentPublicTrips(20);
  const serializableRecentPublicTrips: SerializableTrip[] = recentPublicTrips.map(trip => ({
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
      
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-primary mb-6">
            Shared Savings Tracker
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Plan, save, and achieve your group goals together. Effortlessly track contributions for trips, projects, or any shared expense.
          </p>
          <div className="relative aspect-[3/1] max-w-3xl mx-auto mb-10 rounded-lg overflow-hidden shadow-2xl">
            <Image 
              src="https://res.cloudinary.com/dz6pgtofb/image/upload/v1747564330/SHARED_SAVING_TRACKER_ottbou.png" 
              alt="Shared Savings Tracker App Banner" 
              layout="fill" 
              objectFit="cover"
              data-ai-hint="app banner" 
              priority
            />
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild className="shadow-lg hover:shadow-xl transition-shadow">
              <Link href="/trips">
                 <Route className="mr-2 h-5 w-5" /> Explore Trips
              </Link>
            </Button>
            {user ? (
              <Button size="lg" variant="outline" asChild className="shadow-lg hover:shadow-xl transition-shadow">
                <Link href="/manage-trips">Create / Manage Trips</Link>
              </Button>
            ) : (
              <Button size="lg" variant="outline" asChild className="shadow-lg hover:shadow-xl transition-shadow">
                 <a href="/api/auth/login?returnTo=/manage-trips">
                  <LogIn className="mr-2 h-5 w-5" /> Login to Create Trip
                </a>
              </Button>
            )}
          </div>
        </div>
      </section>

      <section id="features" className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-semibold text-center text-primary mb-12">
            Powerful Features to Simplify Group Savings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow transform hover:-translate-y-1">
                <CardHeader className="items-center text-center">
                  <div className="p-3 bg-primary/10 rounded-full mb-3">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Separator className="my-12" />

      <main className="flex-grow container mx-auto px-4 py-8">
         <section id="recent-trips" className="mb-12">
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-3xl md:text-4xl flex items-center">
                <ListChecks className="mr-3 h-8 w-8 text-primary" />
                Recently Created Trips
              </CardTitle>
              <CardDescription className="mt-2">
                Explore recently created savings goals. Click 'View' to see details and contribute.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {serializableRecentPublicTrips.length === 0 ? (
                <Alert variant="default">
                  <Info className="h-4 w-4" />
                  <AlertTitle>No Trips Available</AlertTitle>
                  <AlertDescription>
                    There are currently no savings trips in the system. If you're logged in, you can create one!
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="whitespace-nowrap">Trip Name</TableHead>
                        <TableHead className="whitespace-nowrap">Created By</TableHead>
                        <TableHead className="whitespace-nowrap">Created At</TableHead>
                        <TableHead className="text-right whitespace-nowrap">Goal (₹)</TableHead>
                        <TableHead className="text-center min-w-[120px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {serializableRecentPublicTrips.map((trip) => (
                        <TableRow key={trip._id}>
                          <TableCell className="font-medium whitespace-nowrap">{trip.name}</TableCell>
                          <TableCell className="whitespace-nowrap text-sm text-muted-foreground">{trip.userEmail || 'N/A'}</TableCell>
                          <TableCell className="whitespace-nowrap">
                            <FormattedDateDisplay dateString={trip.createdAt} formatString="PP" />
                          </TableCell>
                          <TableCell className="text-right whitespace-nowrap">
                            {trip.goalAmount ? trip.goalAmount.toLocaleString() : '-'}
                          </TableCell>
                          <TableCell className="min-w-[120px] text-center">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/trips?tripId=${trip._id}`}>
                                <Eye className="mr-2 h-4 w-4" /> View
                              </Link>
                            </Button>
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

    