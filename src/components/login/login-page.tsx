'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/dashboard');
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <Logo />
          </div>
          <CardTitle className="font-headline text-3xl">
            Welcome to TenantFlow
          </CardTitle>
          <CardDescription>
            The Multi-Tenant Platform for modern applications.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
           <p className="text-center text-muted-foreground">Redirecting to dashboard...</p>
        </CardContent>
      </Card>
    </div>
  );
}
