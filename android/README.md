# 润杰的小游戏 Android APK

这是一个本地 WebView APK 工程，入口页面在 `app/src/main/assets/index.html`。

## 构建 APK

1. 安装 Android Studio，并安装 Android SDK 35。
2. 用 Android Studio 打开本目录 `android`。
3. 等待 Gradle 同步完成。
4. 选择 `Build > Build Bundle(s) / APK(s) > Build APK(s)`。

命令行环境中如果已有 Gradle 和 Android SDK，也可以运行：

```powershell
gradle assembleDebug
```

生成位置：

```text
app/build/outputs/apk/debug/app-debug.apk
```
