# THSController
Temperature and humidity sensor controller

# Debug run:
yarn install
yarn android

# Release build procedure:
react-native bundle --dev false --platform android --entry-file index.js --bundle-output ./android/app/src/main/assets/index.android.bundle --assets-dest ./android/app/src/main/res
cd android -> gradlew assembleRelease
cd app/build/outputs/release -> adb app-release.apk

# ToDo list:
- [x] Query data from sensor
- [x] Work with n sensors at once
- [x] Background worker for querying the data
- [x] Sipmle live graph (last 6 values)
- [ ] Scan network for sensors
- [ ] Data export
- [ ] Graph view
- [ ] Set sensor parameters
