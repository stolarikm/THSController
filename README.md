# THSController
Temperature and humidity sensor controller
Download link: https://bit.ly/3x5pDEh

# Debug run:
- yarn install
- yarn android

# Release build procedure:
- react-native bundle --dev false --platform android --entry-file index.js --bundle-output ./android/app/src/main/assets/index.android.bundle --assets-dest ./android/app/src/main/res
- cd android -> gradlew assembleRelease
- delete unnecessary added files (android/app/drawables, ref)
- (to install via USB) cd app/build/outputs/apk/release -> adb install app-release.apk

# ToDo list:
