$zipPath = "$env:TEMP\ninja-win.zip"
$extractPath = "$env:TEMP\ninja-temp"

Write-Host "Downloading modern ninja from GitHub releases..."
curl.exe -sL -o $zipPath "https://github.com/ninja-build/ninja/releases/download/v1.12.1/ninja-win.zip"

if (Test-Path $extractPath) {
    Remove-Item -Recurse -Force $extractPath
}
Expand-Archive -Path $zipPath -DestinationPath $extractPath -Force

$newNinja = "$extractPath\ninja.exe"
Write-Host "Downloaded version:"
& $newNinja --version

$sdkNinja = "C:\Users\Hitesh\AppData\Local\Android\Sdk\cmake\3.22.1\bin\ninja.exe"
$backupNinja = "C:\Users\Hitesh\AppData\Local\Android\Sdk\cmake\3.22.1\bin\ninja.exe.bak"

if (!(Test-Path $backupNinja)) {
    Copy-Item $sdkNinja $backupNinja -Force
    Write-Host "Backed up original ninja to $backupNinja"
}

Copy-Item $newNinja $sdkNinja -Force
Write-Host "Replaced SDK ninja. Active version now:"
& $sdkNinja --version
