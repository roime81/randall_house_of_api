import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Home, PanelLeft } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/logo';

export const metadata: Metadata = {
  title: 'Randall House',
  description: 'The Multi-Cloud Integration Platform for modern applications.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
           <div className="flex min-h-screen w-full flex-col bg-background">
            <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-card px-4 md:px-6">
              <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
                <Link
                  href="/"
                  className="flex items-center gap-2 text-lg font-semibold md:text-base"
                >
                  <Logo />
                  <span className="sr-only">Randall House</span>
                </Link>
                <Link
                  href="/"
                  className="flex items-center gap-2 font-semibold text-foreground transition-colors hover:text-foreground/80"
                >
                  <Home className="h-4 w-4" />
                  Dashboard
                </Link>
              </nav>
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0 md:hidden"
                  >
                    <PanelLeft className="h-5 w-5" />
                    <span className="sr-only">Toggle navigation menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <nav className="grid gap-6 text-lg font-medium">
                    <Link
                      href="#"
                      className="flex items-center gap-2 text-lg font-semibold"
                    >
                      <Logo />
                      <span className="sr-only">Randall House</span>
                    </Link>
                    <Link href="/" className="hover:text-foreground/80">
                      Dashboard
                    </Link>
                  </nav>
                </SheetContent>
              </Sheet>
               <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
                <div className="ml-auto flex-1 sm:flex-initial">
                  {/* Future search bar location */}
                </div>
              </div>
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
              {children}
            </main>
          </div>
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
