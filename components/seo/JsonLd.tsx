// components/seo/JsonLd.tsx
type JsonLdProps = {
    data: Record<string, unknown>;
};

/**
 * A component to inject a JSON-LD object into the page.
 *
 * @example
 * <JsonLd data={{
 *     "@context": "https://schema.org",
 *     "@type": "Organization",
 *     name: "Example",
 *     url: "https://example.com",
 *     logo: "https://example.com/logo.png",
 * }} />
 *
 * @param {JsonLdProps} props
 * @returns {JSX.Element}
 */
export function JsonLd({ data }: JsonLdProps) {
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
    );
}