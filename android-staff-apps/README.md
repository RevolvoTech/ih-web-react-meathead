# Meathead staff Android apps

Two small Android WebView shells are built from one project:

- `rider`: Meathead Rider, opening `https://meatheadpakistan.vercel.app/rider`
- `chef`: Meathead Chef, opening `https://meatheadpakistan.vercel.app/chef`

The remote site remains the source of truth, so ordinary frontend deployments appear in the apps without publishing new APKs. Rebuild only when native behavior, app icons, permissions, the start domain, or the app version changes.

## Build

From this directory on Windows:

```powershell
.\gradlew.bat clean assembleRelease
```

Artifacts are generated under `app/build/outputs/apk/<role>/release/`.

The current internal release variants are non-debuggable but use the local Android debug certificate so they can be installed immediately. Keep that certificate if you want future APKs to install as updates. Before Google Play or public distribution, configure a private release keystore and Play App Signing.

## Security and session behavior

- No staff email, password, access token, or refresh token is embedded in either APK.
- Each app has separate Android storage because each uses a distinct application ID.
- Staff log in once; Supabase persists and rotates the session inside that app's WebView storage.
- Cleartext HTTP, file/content access, third-party cookies, WebView debugging, backups, and mixed content are disabled.
- Only the Meathead deployment host is allowed to navigate inside the WebView. Maps, phone, email, and other web links open in their appropriate external app.
- Only the Rider variant requests location permission.
