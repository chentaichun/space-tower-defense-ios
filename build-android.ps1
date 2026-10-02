param(
  [ValidateSet("apk", "aab", "all")]
  [string]$Target = "all",
  [ValidateSet("closed-test", "production")]
  [string]$Channel = "closed-test"
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-21.0.11.10-hotspot"
$env:ANDROID_HOME = "C:\Users\User\Android\Sdk"
$env:ANDROID_SDK_ROOT = $env:ANDROID_HOME
$env:Path = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\cmdline-tools\latest\bin;$env:ANDROID_HOME\platform-tools;$env:Path"

Push-Location $root
try {
  npm.cmd run cap:sync
  # The iOS and Android builds can have different store build numbers while
  # sharing the same game version. Stamp the Android asset after Capacitor sync
  # so the in-game update check sees the installed Android versionCode.
  $gradleText = Get-Content -LiteralPath "$root\android\app\build.gradle" -Raw
  $versionCodeMatch = [regex]::Match($gradleText, "versionCode\s+(\d+)")
  if (-not $versionCodeMatch.Success) {
    throw "Could not read Android versionCode."
  }
  $versionCode = $versionCodeMatch.Groups[1].Value
  $androidIndex = Join-Path $root "android\app\src\main\assets\public\index.html"
  $indexText = Get-Content -LiteralPath $androidIndex -Raw
  if ($indexText -notmatch 'data-game-version-code="\d+"') {
    throw "Could not find the game version code in Android index.html."
  }
  $indexText = [regex]::Replace($indexText, 'data-game-version-code="\d+"', "data-game-version-code=`"$versionCode`"", 1)
  [IO.File]::WriteAllText($androidIndex, $indexText, [Text.UTF8Encoding]::new($false))
  # iOS uses MP3 while Android uses the matching OGG files. Keep both in the
  # shared web source, but package only the Android format in the AAB.
  $androidAudioRoot = Join-Path $root "android\app\src\main\assets\public\assets"
  foreach ($audioFolder in @("music", "sfx")) {
    $audioPath = Join-Path $androidAudioRoot $audioFolder
    if (-not (Test-Path -LiteralPath $audioPath)) { continue }
    foreach ($mp3 in Get-ChildItem -LiteralPath $audioPath -Filter "*.mp3" -File) {
      $ogg = [IO.Path]::ChangeExtension($mp3.FullName, ".ogg")
      if (Test-Path -LiteralPath $ogg) { Remove-Item -LiteralPath $mp3.FullName -Force }
    }
  }
  # Capacitor regenerates this legacy Cordova preference file even though the
  # Android app does not reference it. Remove it so every release build stays
  # Android Lint clean instead of reintroducing an UnusedResources warning.
  $legacyCordovaConfig = Join-Path $root "android\app\src\main\res\xml\config.xml"
  if (Test-Path -LiteralPath $legacyCordovaConfig) {
    Remove-Item -LiteralPath $legacyCordovaConfig -Force
  }
  $adConfigSource = Join-Path $root "release\admob.$Channel.js"
  $adConfigDestination = Join-Path $root "android\app\src\main\assets\public\admob-config.js"
  if (-not (Test-Path -LiteralPath $adConfigSource)) {
    throw "AdMob release configuration is missing for channel '$Channel'."
  }
  Copy-Item -LiteralPath $adConfigSource -Destination $adConfigDestination -Force
  if ($Target -eq "apk" -or $Target -eq "all") {
    & "$root\android\gradlew.bat" -p "$root\android" assembleDebug
    if ($LASTEXITCODE -ne 0) { throw "Android debug APK build failed." }
    Copy-Item -LiteralPath "$root\android\app\build\outputs\apk\debug\app-debug.apk" -Destination "$env:USERPROFILE\Desktop\SpaceTowerDefense-debug.apk" -Force
  }
  if ($Target -eq "aab" -or $Target -eq "all") {
    & "$root\android\gradlew.bat" -p "$root\android" bundleRelease
    if ($LASTEXITCODE -ne 0) { throw "Android App Bundle build failed." }

    $unsignedAab = "$root\android\app\build\outputs\bundle\release\app-release.aab"
    $artifactLabel = if ($Channel -eq "production") { "Production" } else { "Closed-Test" }
    $signedAab = "$env:USERPROFILE\Desktop\SpaceTowerDefense-$artifactLabel-v$versionCode.aab"
    $keyBackup = @(
      "$env:USERPROFILE\Desktop\SpaceTowerDefense-upload-key-backup.txt",
      "$env:USERPROFILE\Desktop\spacetower\SpaceTowerDefense-upload-key-backup.txt"
    ) | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
    $keyStore = "$root\release\space-tower-defense-upload.jks"

    if (-not $keyBackup -or -not (Test-Path -LiteralPath $keyStore)) {
      throw "Upload-key backup or keystore is missing; refusing to create an unsigned Play upload."
    }

    $keyText = Get-Content -LiteralPath $keyBackup -Raw
    $aliasMatch = [regex]::Match($keyText, "Alias:\s*\r?\n([^\r\n]+)")
    $passwordMatch = [regex]::Match($keyText, "Keystore password / key password:\s*\r?\n([^\r\n]+)")
    if (-not $aliasMatch.Success -or -not $passwordMatch.Success) {
      throw "Could not read the upload-key alias/password from the local backup file."
    }

    $keyAlias = $aliasMatch.Groups[1].Value.Trim()
    $keyPassword = $passwordMatch.Groups[1].Value.Trim()
    $signedTemp = "$env:TEMP\SpaceTowerDefense-$artifactLabel-v$versionCode-signed.aab"
    if (Test-Path -LiteralPath $signedTemp) { Remove-Item -LiteralPath $signedTemp -Force }

    & "$env:JAVA_HOME\bin\jarsigner.exe" -keystore $keyStore -storepass $keyPassword -keypass $keyPassword -sigalg SHA256withRSA -digestalg SHA-256 -signedjar $signedTemp $unsignedAab $keyAlias
    if ($LASTEXITCODE -ne 0) { throw "Signing the Android App Bundle failed." }
    Move-Item -LiteralPath $signedTemp -Destination $signedAab -Force
  }
} finally {
  Pop-Location
}
