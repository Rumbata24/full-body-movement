import { BottomNav } from "@/components/BottomNav";
import { UserProvider } from "@/lib/supabase/UserProvider";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
      <div className="flex min-h-dvh flex-col">
        <main className="mx-auto w-full max-w-md flex-1 px-5 pb-4 pt-[calc(env(safe-area-inset-top)+1.5rem)]">
          {children}
        </main>
        <BottomNav />
      </div>
    </UserProvider>
  );
}
