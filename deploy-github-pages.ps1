# ============================================================
# 仓储管理系统 - GitHub Pages 一键部署脚本
# 自动完成：配置 homepage -> 配置 deploy 脚本 -> 构建 -> 提交推送 -> gh-pages 发布
#
# 运行方式（在项目目录 D:\仓储管理系统 下执行）：
#   1) 首次运行先放开脚本执行策略（你之前已执行过，可跳过）：
#        Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
#   2) 运行本脚本：
#        .\deploy-github-pages.ps1
# ============================================================

$ErrorActionPreference = "Stop"
$ProjectDir = if ($PSScriptRoot) { $PSScriptRoot } else { (Get-Location).Path }
Set-Location $ProjectDir

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " GitHub Pages 部署脚本" -ForegroundColor Cyan
Write-Host " 项目目录: $ProjectDir" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# ---------- 1. 检查必要工具 ----------
Write-Host ""
Write-Host "[1/6] 检查 node / npm / git ..." -ForegroundColor Yellow
foreach ($cmd in @("node", "npm", "git")) {
    if (-not (Get-Command $cmd -ErrorAction SilentlyContinue)) {
        Write-Host "[失败] 未找到 $cmd，请先安装后重试" -ForegroundColor Red
        exit 1
    }
}
Write-Host "[完成] node / npm / git 检查通过" -ForegroundColor Green

# ---------- 2. 检查并解析远程仓库 ----------
Write-Host ""
Write-Host "[2/6] 检查 git 远程仓库 ..." -ForegroundColor Yellow
$remote = git config --get remote.origin.url
if (-not $remote) {
    Write-Host "[失败] 未配置远程仓库。请先执行：" -ForegroundColor Red
    Write-Host "       git remote add origin https://github.com/<你的用户名>/<仓库名>.git"
    exit 1
}
Write-Host "[完成] 远程仓库: $remote" -ForegroundColor Green

$m = [regex]::Match($remote, "(?:github\.com[:/])([^/]+)/([^/]+?)(?:\.git)?$")
if (-not $m.Success) {
    Write-Host "[失败] 无法从远程地址解析仓库，请确认远程地址是 github.com 标准格式" -ForegroundColor Red
    exit 1
}
$userName = $m.Groups[1].Value
$repoName = $m.Groups[2].Value
$homepage = "https://$userName.github.io/$repoName/"
Write-Host "       用户名: $userName | 仓库: $repoName" -ForegroundColor DarkGray
Write-Host "       部署地址: $homepage" -ForegroundColor DarkGray

# ---------- 3. 配置 package.json ----------
Write-Host ""
Write-Host "[3/6] 配置 package.json (homepage + deploy 脚本) ..." -ForegroundColor Yellow
$pkgPath = Join-Path $ProjectDir "package.json"
if (-not (Test-Path $pkgPath)) {
    Write-Host "[失败] 未找到 package.json，请确认在项目根目录运行" -ForegroundColor Red
    exit 1
}
# 显式以 UTF-8 读取，避免 PS5.1 默认按 ANSI(GBK) 解析无 BOM 的 package.json 导致中文乱码、JSON 解析失败
$pkg = [System.IO.File]::ReadAllText($pkgPath, [System.Text.UTF8Encoding]::new($false)) | ConvertFrom-Json
if (-not $pkg.PSObject.Properties["homepage"]) {
    $pkg | Add-Member -NotePropertyName "homepage" -NotePropertyValue $homepage
    Write-Host "       - 已添加 homepage = $homepage" -ForegroundColor DarkGray
} else {
    Write-Host "       - homepage 已存在: $($pkg.homepage)（保持不变）" -ForegroundColor DarkGray
}
if (-not $pkg.PSObject.Properties["scripts"]) {
    $pkg | Add-Member -NotePropertyName "scripts" -NotePropertyValue ([ordered]@{ "deploy" = "gh-pages -d dist" })
    Write-Host "       - 已创建 scripts.deploy = gh-pages -d dist" -ForegroundColor DarkGray
} elseif (-not $pkg.scripts.PSObject.Properties["deploy"]) {
    $pkg.scripts | Add-Member -NotePropertyName "deploy" -NotePropertyValue "gh-pages -d dist"
    Write-Host "       - 已添加 scripts.deploy = gh-pages -d dist" -ForegroundColor DarkGray
} else {
    Write-Host "       - scripts.deploy 已存在: $($pkg.scripts.deploy)（保持不变）" -ForegroundColor DarkGray
}
$jsonOut = $pkg | ConvertTo-Json -Depth 20
[System.IO.File]::WriteAllText($pkgPath, $jsonOut, [System.Text.UTF8Encoding]::new($false))
Write-Host "[完成] package.json 已更新" -ForegroundColor Green

# ---------- 4. 构建 ----------
Write-Host ""
Write-Host "[4/6] 执行 npm run build ..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "[失败] 构建出错，请根据上方报错排查" -ForegroundColor Red
    exit 1
}
if (-not (Test-Path (Join-Path $ProjectDir "dist"))) {
    Write-Host "[失败] 构建完成但未发现 dist 目录，请检查构建输出目录配置" -ForegroundColor Red
    exit 1
}
Write-Host "[完成] 构建成功，dist 目录已生成" -ForegroundColor Green

# ---------- 5. 提交并推送源码 ----------
Write-Host ""
Write-Host "[5/6] 提交并推送代码到 GitHub ..." -ForegroundColor Yellow
if (-not (git config --get user.name) -or -not (git config --get user.email)) {
    Write-Host "[提示] 未配置 git 用户信息，请先执行：" -ForegroundColor Yellow
    Write-Host "       git config --global user.name ""你的名字"""
    Write-Host "       git config --global user.email ""你的邮箱"""
    exit 1
}
git add -A
if (-not (git diff --cached --quiet)) {
    git commit -m "deploy: 更新构建产物并部署 GitHub Pages"
    Write-Host "       - 已提交代码" -ForegroundColor DarkGray
} else {
    Write-Host "       - 没有新的代码变更，跳过提交" -ForegroundColor DarkGray
}
$branch = (git branch --show-current).Trim()
if (-not $branch) {
    git checkout -b main | Out-Null
    $branch = "main"
}
git push -u origin $branch
if ($LASTEXITCODE -ne 0) {
    Write-Host "[失败] 推送失败，请检查网络或 GitHub 登录状态" -ForegroundColor Red
    exit 1
}
Write-Host "[完成] 源码已推送到 GitHub" -ForegroundColor Green

# ---------- 6. 发布到 gh-pages ----------
Write-Host ""
Write-Host "[6/6] 执行 npm run deploy (发布到 gh-pages 分支) ..." -ForegroundColor Yellow
npm run deploy
if ($LASTEXITCODE -ne 0) {
    Write-Host "[失败] gh-pages 发布失败，请检查上方报错" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host " 部署完成！" -ForegroundColor Green
Write-Host " 页面地址: $homepage" -ForegroundColor Green
Write-Host " 若首次发布，请到 GitHub 仓库 Settings -> Pages" -ForegroundColor Green
Write-Host " 将 Source 选为 gh-pages 分支，等待 1-2 分钟即可访问" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
