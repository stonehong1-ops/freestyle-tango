import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';
import { adminMessaging } from '@/lib/firebase-admin';

export async function GET() {
  const sa = process.env.FIREBASE_SERVICE_ACCOUNT;
  let status = 'Not initialized';
  let projectId = null;
  let clientEmail = null;
  
  if (admin.apps.length > 0) {
    status = 'Initialized';
    const app = admin.apps[0];
    // @ts-ignore - access options
    projectId = app.options.credential?.projectId || app.options.projectId;
    // Attempt to get from credential if possible
    try {
      // @ts-ignore
      clientEmail = app.options.credential?.clientEmail;
    } catch (e) {}
  }

  // Diagnostic parsing of the string to see what's wrong (without letting it crash the response)
  let parseError = null;
  let errorSnippet = null;
  if (sa) {
    try {
      JSON.parse(sa);
    } catch (e: any) {
      parseError = e.message;
      // Extract position from "at position 1436"
      const posMatch = e.message.match(/position (\d+)/);
      if (posMatch) {
        const pos = parseInt(posMatch[1], 10);
        errorSnippet = sa.substring(Math.max(0, pos - 20), Math.min(sa.length, pos + 20));
        // Add a marker at the position
        errorSnippet = errorSnippet.substring(0, 20) + ">>>" + errorSnippet.substring(20, 21) + "<<<" + errorSnippet.substring(21);
      }
    }
  }

  return NextResponse.json({
    envExists: !!sa,
    envLength: sa ? sa.length : 0,
    appsCount: admin.apps.length,
    projectId,
    clientEmail,
    parseError,
    errorSnippet,
    status
  });
}
