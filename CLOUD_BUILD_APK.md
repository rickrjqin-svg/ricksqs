# GitHub Actions 云端打包 APK

本项目已经配置好云端打包流程：`.github/workflows/build-apk.yml`。

## 使用步骤

1. 把整个 `ui` 文件夹上传到 GitHub 仓库。
2. 打开 GitHub 仓库页面，进入 `Actions`。
3. 选择左侧 `Build Android APK`。
4. 点击 `Run workflow`。
5. 等待构建完成。
6. 打开完成的 workflow run，在页面底部 `Artifacts` 下载：

```text
runjie-mini-games-debug-apk
```

下载后解压，里面就是：

```text
app-debug.apk
```

## 输出位置

GitHub Actions 内部生成路径：

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

## 说明

这是 debug APK，可以直接安装测试。手机如果提示未知来源，需要允许当前文件管理器或浏览器安装未知应用。
