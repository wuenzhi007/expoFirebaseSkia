# expoFirebaseSkia

Expo managed app with:
- Skia drawing (`@shopify/react-native-skia`)
- React Native Reanimated (`react-native-reanimated`)
- Firebase Analytics, Messaging, Remote Config (`@react-native-firebase/*`)

## 运行 & 构建

1. 安装依赖:
   ```bash
   npm install
   ```

2. 本地预编译:
   ```bash
   npm run prebuild
   ```

3. 本地运行 Android:
   ```bash
   npm run android
   ```

4. 本地运行 iOS:
   ```bash
   npm run ios
   ```

5. 使用 EAS 构建:
   ```bash
   npx eas build --platform all
   ```

6. GitHub Actions 自动构建 (推荐):
   - 在 GitHub 仓库设置中添加 `EXPO_TOKEN` secret
   - 推送代码到 main 分支，自动触发 iOS development 构建
   - **选项1 (使用 EAS Build)**: 需要 Expo 账户的 EAS Build 额度
   - **选项2 (本地构建)**: 使用 GitHub Actions 免费 macOS runners，无需 EAS 额度

## Firebase 配置说明

当前仓库已提供占位符 `google-services.json` 和 `GoogleService-Info.plist`，用于确保 iOS/Android 能够成功编译。

请使用你自己的 Firebase 项目文件替换这两个占位符文件，以便在真实设备上执行 Analytics、Messaging、Remote Config。