const SITE_URL = process.env.EXPO_PUBLIC_SITE_URL || 'https://gaadi.pk'

export default {
  expo: {
    name: 'gaadi.pk',
    slug: 'gaadi-pk',
    version: '1.1.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    scheme: 'gaadipk',
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#2563eb',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'pk.gaadi.app',
    },
    android: {
      package: 'pk.gaadi.app',
      versionCode: 3,
      adaptiveIcon: {
        foregroundImage: './assets/android-icon-foreground.png',
        backgroundImage: './assets/android-icon-background.png',
        monochromeImage: './assets/android-icon-monochrome.png',
        backgroundColor: '#2563eb',
      },
      intentFilters: [
        {
          action: 'VIEW',
          autoVerify: true,
          data: [
            {
              scheme: 'https',
              host: 'gaadi.pk',
              pathPrefix: '/',
            },
          ],
          category: ['BROWSABLE', 'DEFAULT'],
        },
      ],
      permissions: ['INTERNET', 'ACCESS_NETWORK_STATE'],
      softwareKeyboardLayoutMode: 'resize',
    },
    web: {
      favicon: './assets/favicon.png',
    },
    plugins: [
      'expo-font',
      'expo-web-browser',
      [
        'expo-splash-screen',
        {
          backgroundColor: '#2563eb',
          image: './assets/splash-icon.png',
          imageWidth: 200,
        },
      ],
    ],
    extra: {
      siteUrl: SITE_URL,
    },
  },
}
