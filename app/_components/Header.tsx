'use client'
import { ReceiptText } from "lucide-react"
import ModeToggle from "./DarkModeToggle"
import { OrganizationSwitcher, SignedIn, SignedOut, SignInButton, SignUpButton, useClerk, UserButton, useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"

function Header() {

  //Clerk Auth
  const User = useUser();
  const user = User.user;

  //Clerk PopUps
  const { openSignIn } = useClerk();
  const { openSignUp } = useClerk();

  return (
    <main className='h-20 w-full flex items-center justify-between px-18'>
      <div className="inline-flex gap-8">
        <span className="ml-[-40] inline-flex gap-4">
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
            <Button 
              variant="outline"
              onClick={()=>openSignIn()}
            >
              Sign In
            </Button>
            <Button
              onClick={()=>openSignUp()}
            >
              Sign Up
            </Button>
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