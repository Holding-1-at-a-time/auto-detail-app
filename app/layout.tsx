import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import { ClerkProvider } from "@clerk/nextjs";
import Header from "@/components/nav/Header";
import { dark } from '@clerk/themes'


const inter = Inter({ subsets: ["latin"] });

// SEO Metadata - This is crucial!
export const metadata: Metadata = {
  title: "Detailing Co. | Premium Auto Detailing & Assessment",
  description: "Get a frictionless, transparent quote for premium auto detailing services. From interior cleaning to ceramic coatings, we restore your vehicle's shine.",
};

// JSON-LD Schema for SEO - Tells Google you're a local business
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'AutoDetailing',
  name: 'Detailing Co.',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '123 Detailing Ave',
    addressLocality: 'San Antonio',
    addressRegion: 'TX',
    postalCode: '78201',
    addressCountry: 'US',
  },
  telephone: '+1-210-555-0123',
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '17:00',
    },
  ],
  url: 'https://your-app-url.com', // Replace with your actual domain
  image: 'https://your-app-url.com/og-image.png', // Replace with a link to your logo
  priceRange: '$$',
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClerkProvider
          dynamic
          appearance={{
            baseTheme: dark,
            variables: { colorPrimary: '#00AE98' }
          }}
        >
          <Header />
          <ConvexClientProvider>{children}</ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html >
  );
}
