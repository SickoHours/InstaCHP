'use client';

/**
 * Magic Link Handler - V1.8.0
 *
 * Decodes magic link tokens and redirects to appropriate pages.
 * In V1, this is a simple client-side redirect.
 * In V2+, this will include server-side validation and HMAC verification.
 *
 * Token formats:
 * - ma_jobId_expiry (upload_auth)
 * - mv_jobId_expiry (view_job)
 * - md_jobId_downloadToken_expiry (download_report)
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { decodeMagicToken, getMagicLinkDestination } from '@/lib/magicLinks';
import { AlertTriangle, Loader2, ExternalLink } from 'lucide-react';

interface MagicLinkPageProps {
  params: Promise<{ token: string }>;
}

export default function MagicLinkPage({ params }: MagicLinkPageProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    async function processToken() {
      try {
        const resolvedParams = await params;
        const token = resolvedParams.token;
        const decoded = decodeMagicToken(token);

        if (!decoded.isValid) {
          setError('This link is invalid. Please request a new link from your dashboard.');
          setIsProcessing(false);
          return;
        }

        if (decoded.isExpired) {
          setError('This link has expired. Please request a new link from your dashboard.');
          setIsProcessing(false);
          return;
        }

        // Determine user type based on action
        // In V2, this would be determined by the authenticated user
        // For V1, we default to law_firm for most actions
        const userType = 'law_firm';

        // Get destination URL
        const destination = getMagicLinkDestination(
          decoded.action,
          decoded.jobId,
          userType,
          decoded.downloadToken
        );

        // Log in dev mode
        if (process.env.NODE_ENV === 'development') {
          console.log('[MagicLink] Redirecting:', {
            action: decoded.action,
            jobId: decoded.jobId,
            destination,
          });
        }

        // Redirect to destination
        router.replace(destination);
      } catch (err) {
        console.error('[MagicLink] Error processing token:', err);
        setError('An error occurred while processing this link. Please try again.');
        setIsProcessing(false);
      }
    }

    processToken();
  }, [params, router]);

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-slate-900/60 backdrop-blur-xl border border-red-500/30 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="text-xl font-semibold text-white mb-2">Link Error</h1>
            <p className="text-slate-400 mb-6">{error}</p>
            <button
              onClick={() => router.push('/law')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state while processing
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-6">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          </div>
          <h1 className="text-xl font-semibold text-white mb-2">Processing Link</h1>
          <p className="text-slate-400">
            {isProcessing ? 'Redirecting you to the right place...' : 'Please wait...'}
          </p>
        </div>
      </div>
    </div>
  );
}
