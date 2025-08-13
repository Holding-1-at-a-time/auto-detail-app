// components/header.tsx
'use client';

import { useRouter, useParams } from "next/navigation";

import {
    CreateOrganization,
    OrganizationSwitcher,
    SignInButton,
    SignUpButton,
    SignedIn,
    SignedOut,
    UserButton,
    useOrganization,
} from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Header() {
    const { organization } = useOrganization();
    const organizationId = organization?.id;
    const router = useRouter();


    return (
        <header className="border-b border-white/10">
            <div className="container h-16 flex items-center justify-between">
                <Link href="/">
                    <h1 className="font-bold">Slick Solutions</h1>
                </Link>
                <div className="flex items-center gap-4">
                    <SignedIn>
                        {organizationId && (
                            <Button asChild>
                                <Link href={`/${organizationId}/dashboard`}>Client Dashboard</Link>
                            </Button>
                        )}
                        router.push(`/${organizationId}/dashboard`);



                        <OrganizationSwitcher />
                        <UserButton signOutUrl="/" />
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