/**
 * Staff Escalations Redirect (V1.7.0)
 *
 * V1.7.0: This page now redirects to the main staff dashboard with the
 * 'escalated' filter. The escalations view is now integrated into the
 * main dashboard as the default view.
 *
 * This redirect preserves any existing bookmarks or links.
 */

import { redirect } from 'next/navigation';

export default function EscalationsRedirect() {
  // Redirect to main staff queue with escalated filter
  redirect('/staff');
}
