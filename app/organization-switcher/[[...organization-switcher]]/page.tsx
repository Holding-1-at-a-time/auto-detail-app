import { OrganizationSwitcher } from '@clerk/nextjs'

/**
 * Page for switching between organizations.
 *
 * This page displays the Clerk OrganizationSwitcher component, which allows
 * users to seamlessly switch between different organizations they belong to.
 * The component automatically handles the logic for organization selection
 * and updates the current session accordingly.
 */

export default function OrganizationSwitcherPage() {
    return <OrganizationSwitcher />
}