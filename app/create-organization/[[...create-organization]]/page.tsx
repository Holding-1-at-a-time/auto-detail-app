import { CreateOrganization } from '@clerk/nextjs'

/**
 * Page for creating a new organization.
 *
 * This page displays the Clerk CreateOrganization component, which renders a
 * form for creating a new organization. The component automatically handles
 * form validation and submission, and redirects the user to the dashboard
 * after a successful submission.
 */
export default function CreateOrganizationPage() {
    return <CreateOrganization />
}