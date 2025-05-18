
'use client'; // This page is now just a client-side redirect

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Loading from '@/app/loading'; // Assuming you have a global loading component

export default function OldAdminPageRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/manage-trips');
  }, [router]);

  return <Loading />; // Show loading spinner during redirect
}

    