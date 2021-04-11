# THSController
Temperature and humidity sensor controller

# Debug run:
- yarn install
- yarn android

# Release build procedure:
- react-native bundle --dev false --platform android --entry-file index.js --bundle-output ./android/app/src/main/assets/index.android.bundle --assets-dest ./android/app/src/main/res
- cd android -> gradlew assembleRelease
- cd app/build/outputs/release -> adb app-release.apk

# ToDo list:
- Config (in drawer, set timeouts, starting IP suffix, ...)
- Commands list, and domain (JSON, reset command)
- Responsive cards/chips for more devices
- Responsive graph (fullscreen when landscape oriented)
- Check when turning on gateway mode (attribute in Firebase)
- Checkboxes, colors on monitor screen
- Tests
