'use client'
import { ReceiptText } from "lucide-react"
import ModeToggle from "./DarkModeToggle"
import { OrganizationSwitcher, SignedIn, SignedOut, SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"

function Header() {
  const User = useUser();
  const user = User.user;
  return (
    <main className='h-20 flex items-center justify-between px-18'>
      <div className="inline-flex gap-8">
        <span className="ml-[-40]">
          <SignedIn>
            <SidebarTrigger />
            <OrganizationSwitcher/>
          </SignedIn>
        </span>
        <SignedOut>
          <span className="inline-flex items-center gap-3 font-bold">
            <ReceiptText />
            <h1>Recharge Manager</h1>
          </span>
        </SignedOut>
      </div>
      <div className="inline-flex gap-4">
        <SignedOut>
          <SignInButton>
            <Button variant="outline">
              Sign In
            </Button>
          </SignInButton>
          <SignUpButton>
            <Button>
              Sign Up
            </Button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <div className="inline-flex items-center gap-3">
            <span>Hi, <b>{user?.firstName}</b> !</span>
            <UserButton/>
          </div>
        </SignedIn>
        <div>
          <ModeToggle />
        </div>
      </div>
      
    </main>
  )
}

export default Header