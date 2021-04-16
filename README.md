# THSController
Temperature and humidity sensor controller

# Debug run:
- yarn install
- yarn android

# Release build procedure:
- react-native bundle --dev false --platform android --entry-file index.js --bundle-output ./android/app/src/main/assets/index.android.bundle --assets-dest ./android/app/src/main/res
- cd android -> gradlew assembleRelease
- cd app/build/outputs/apk/release -> adb install app-release.apk
- (delete green drawables + ref), (update SDK version of react-native-navbar-color)

# ToDo list:
- Different time intervals of readings, maybe filters above graph
- Remove old data 
- Device lightbulbs (yellow while reading, green after success, red if error)
- Test on different device
- Tests
