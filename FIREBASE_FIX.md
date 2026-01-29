# 🔧 Fix: Firebase Invalid API Key Error

The error `Uncaught FirebaseError: Firebase: Error (auth/invalid-api-key)` occurs because the frontend application cannot find the Firebase configuration variables during the production build or at runtime.

Since your site is deployed on **Vercel**, you need to add these variables to the Vercel Dashboard.

---

## 🚨 The Problem

Vite bundles environment variables (starting with `VITE_`) into the final JavaScript files **at build time**. If these variables are not present in Vercel's settings when the build starts, they will be `undefined`, causing Firebase to fail.

---

## ✅ Step-by-Step Fix

### Step 1: Add Variables to Vercel

1.  Open your [Vercel Dashboard](https://vercel.com/dashboard).
2.  Select your project: **fleshflow**.
3.  Go to **Settings** → **Environment Variables**.
4.  Add the following variables one by one (using the values from your local `frontend/.env` file):

| Variable Name | Value (Copy from your `.env`) |
| :--- | :--- |
| `VITE_FIREBASE_API_KEY` | `AIzaSyB5sIvgxf0yHG2J4ck5JrNceHpHoNi0MBQ` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `fleshflowapp.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `fleshflowapp` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `fleshflowapp.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `62326277538` |
| `VITE_FIREBASE_APP_ID` | `1:62326277538:web:75b1dfc438d3ec98cb1efb` |
| `VITE_FIREBASE_DATABASE_URL` | `https://fleshflowapp-default-rtdb.firebaseio.com/` |

**Important:** Make sure all checkboxes (**Production**, **Preview**, **Development**) are checked for each variable.

---

### Step 2: Trigger a Redeploy

Environment variables are only baked in during the build process. Adding them now won't fix the *already deployed* site. You must redeploy:

1.  Go to the **Deployments** tab in Vercel.
2.  Find the latest (top) deployment.
3.  Click the three dots (**...**) next to it.
4.  Select **Redeploy**.
5.  Click **Redeploy** again to confirm.

---

### Step 3: Verify Locally (If still failing)

If you see this error while running **locally** with `npm run dev`:

1.  Stop the dev server (`Ctrl + C`).
2.  Ensure your `frontend/.env` file exists and has the keys.
3.  **Restart** the dev server: `npm run dev`.
4.  **Hard Refresh** your browser (`Ctrl + Shift + R`).

---

## ⚠️ Potential Issue: Truncated Keys?

While checking your configuration, I noticed your API Key and App ID seem a bit short:
- `VITE_FIREBASE_API_KEY` is 35 characters (usually 39).
- `VITE_FIREBASE_APP_ID` ends abruptly.

If the error persists AFTER adding variables to Vercel and redeploying, please double-check that you copied the **full strings** from the [Firebase Console](https://console.firebase.google.com/):
1.  Go to **Project Settings** (gear icon).
2.  Scroll down to **Your apps**.
3.  Copy the `apiKey` and `appId` exactly as shown.

---

## 🧪 Verify the Fix
After the Vercel deployment completes:
1.  Visit https://fleshflow.vercel.app/login
2.  The error should be gone.
3.  Try "Continue with Google" - it should now open the Firebase popup.
