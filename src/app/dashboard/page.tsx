
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Loading from '@/app/loading'; // Assuming you have a global loading component

export default function DashboardRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/trips');
  }, [router]);

  return <Loading />; // Show loading spinner during redirect
}
