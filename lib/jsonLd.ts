// lib/jsonLd.ts
export const orgSchema = {
    "@context": "https://schema.org",
    "@type": "AutoDetailing",
    name: "Detailing Co.",
    description: "Premium auto detailing services with a frictionless online assessment and booking process.",
    url: "https://your-domain.com", // <-- IMPORTANT: Replace with your actual domain
    logo: "https://your-domain.com/logo.png", // <-- IMPORTANT: Replace with your logo URL
    contactPoint: {
        "@type": "ContactPoint",
        telephone: "+1-555-555-5555", // <-- IMPORTANT: Replace with your phone number
        contactType: "Customer Service",
    },
    address: {
        "@type": "PostalAddress",
        streetAddress: "123 Detailing Lane", // <-- IMPORTANT: Replace with your address
        addressLocality: "San Antonio",
        addressRegion: "TX",
        postalCode: "78201",
        addressCountry: "US",
    },
};