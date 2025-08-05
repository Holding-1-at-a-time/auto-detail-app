// components/header.tsx
import {
    SignInButton,
    SignUpButton,
    SignedIn,
    SignedOut,
    UserButton,
} from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Header() {
    return (
        <header className="border-b border-white/10">
            <div className="container h-16 flex items-center justify-between">
                <Link href="/">
                    <h1 className="font-bold">Detailing Co.</h1>
                </Link>
                <div className="flex items-center gap-4">
                    <SignedIn>
                        <Button asChild>
                            <Link href="/dashboard">Client Dashboard</Link>
                        </Button>
                        <UserButton afterSignOutUrl="/" />
                    </SignedIn>
                    <SignedOut>
                        {/* The buttons now act as links to the new pages */}
                        <Link href="/sign-in">
                            <Button variant="ghost">Sign In</Button>
                        </Link>
                        <Link href="/sign-up">
                            <Button>Sign Up</Button>
                        </Link>
                    </SignedOut>
                </div>
            </div>
        </header>
    );
}