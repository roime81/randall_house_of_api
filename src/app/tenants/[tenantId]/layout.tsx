'use client';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Home, PanelLeft } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { useAuth, useUser } from '@/firebase/provider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';


export default function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    if (auth) {
      await auth.signOut();
      router.push('/login');
    }
  };


  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-card px-4 sm:px-6">
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-lg font-semibold md:text-base"
          >
            <Logo />
            <span className="sr-only">Randall's House of API</span>
          </Link>
          <Link
            href="/dashboard"
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
                <span className="sr-only">Randall's House of API</span>
              </Link>
              <Link href="/dashboard" className="hover:text-foreground/80">
                Dashboard
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
        <div className="ml-auto flex items-center gap-4">
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="overflow-hidden rounded-full"
                >
                  <Avatar>
                    <AvatarImage
                      src={user.photoURL || ''}
                      alt={user.displayName || ''}
                    />
                    <AvatarFallback>
                      {user.displayName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  {profile?.role === 'admin'
                    ? `Admin: ${user.displayName}`
                    : user.displayName}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">{children}</main>
    </div>
  );
}
