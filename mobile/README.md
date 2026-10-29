# gaadi.pk Android app (React Native / Expo)

Native Android app mirroring the gaadi.pk website: login/signup, passenger booking (search → seats → Safepay/cash), driver listings, and profile.

## Configure API

Defaults to production:

- `EXPO_PUBLIC_SITE_URL=https://gaadi.pk`
- `EXPO_PUBLIC_API_URL=https://gaadi.pk/api`

Create `mobile/.env` to override for a local backend (use your LAN IP, not `localhost`, on a physical phone).

## Run

```bash
cd mobile
npm install
npx expo start
```

## Build installable APK

Use a **release** build (or debug with `debuggableVariants = []`) so the JS
bundle is embedded. Plain `assembleDebug` without that setting waits for Metro
and appears stuck on the splash screen.

```powershell
$env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-17.0.20.101-hotspot"
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:GRADLE_USER_HOME = "D:\g"
cd android
.\gradlew.bat assembleRelease
```

APK path:

`android/app/build/outputs/apk/release/app-release.apk`  
(also copied to `dist-apk/gaadi-pk.apk`)

Install on your phone (enable “Install unknown apps”).

