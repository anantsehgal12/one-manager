'use client'
import Header from "./_components/Header";
import {
  SidebarInset,
} from "@/components/ui/sidebar";
import Side from "./_components/Side";
import { useUser } from "@clerk/nextjs";

export default function Page() {
  const { isSignedIn } = useUser();
  if (isSignedIn) {
    return (
      <>
      <Side />
      <SidebarInset>
       <Header />
          <main className="flex-1 px-15 py-5 w-full">
            <h2 className="text-2xl font-bold mb-4">Welcome to Recharge Manager</h2>
            <p>This is the main content area.</p>
          </main>
        </SidebarInset>
      </>
    );
  } else {
    return (
      <main className="w-full">
        <Header />
      </main>
    );
  }
}
