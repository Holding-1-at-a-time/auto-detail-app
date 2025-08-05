import { OrganizationProfile } from '@clerk/nextjs'

/**
 * Page for displaying an organization's profile.
 *
 * This page renders the Clerk OrganizationProfile component, which displays
 * detailed information about the current organization. The component includes
 * functionality for viewing and editing organization details.
 */

export default function OrganizationProfilePage() {
    return <OrganizationProfile />
}