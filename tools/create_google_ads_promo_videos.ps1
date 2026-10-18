param(
    [string]$ProjectRoot = "C:\Users\User\space_tower_defense",
    [string[]]$Only = @()
)

$ErrorActionPreference = "Stop"

$master = Join-Path $ProjectRoot "promo-video\output\Space-Tower-Defense-Official-Release-Trailer-1080p.mp4"
$imageDir = Join-Path $ProjectRoot "store-assets\google-ads-latam-es-test01-v2-impact"
$musicDir = Join-Path $ProjectRoot "assets\music"
$outputDir = Join-Path $ProjectRoot "store-assets\google-ads-latam-es-test01-videos-v1"

New-Item -ItemType Directory -Force -Path $outputDir | Out-Null

function Get-ClipFilter {
    param(
        [int]$Index,
        [ValidateSet("landscape", "square", "portrait")]
        [string]$Layout,
        [int]$Width,
        [int]$Height,
        [bool]$IsEndCard = $false
    )

    $finish = "setsar=1,eq=contrast=1.10:saturation=1.24,unsharp=5:5:0.55:5:5:0.0,drawbox=x=0:y=0:w=iw:h=10:color=0x28d7ff@0.92:t=fill,drawbox=x=0:y=ih-10:w=iw:h=10:color=0xff2bd6@0.92:t=fill,fade=t=in:st=0:d=0.10,fade=t=out:st=2.88:d=0.12,format=yuv420p"

    if ($Layout -eq "portrait" -or $IsEndCard) {
        $blur = if ($IsEndCard) { 22 } else { 32 }
        $darken = if ($IsEndCard) { -0.10 } else { -0.22 }
        return "[$Index`:v]split=2[bg$Index][fg$Index];" +
            "[bg$Index]scale=$Width`:$Height`:force_original_aspect_ratio=increase,crop=$Width`:$Height,gblur=sigma=$blur,eq=brightness=$darken[blur$Index];" +
            "[fg$Index]scale=$Width`:$Height`:force_original_aspect_ratio=decrease[fit$Index];" +
            "[blur$Index][fit$Index]overlay=(W-w)/2:(H-h)/2,fps=30,trim=duration=3,setpts=PTS-STARTPTS,$finish[v$Index]"
    }

    return "[$Index`:v]scale=$Width`:$Height`:force_original_aspect_ratio=increase,crop=$Width`:$Height,setsar=1,fps=30,trim=duration=3,setpts=PTS-STARTPTS,$finish[v$Index]"
}

function New-PromoVideo {
    param(
        [string]$Name,
        [ValidateSet("landscape", "square", "portrait")]
        [string]$Layout,
        [int[]]$Starts,
        [string]$EndCard,
        [string]$Music
    )

    if ($Starts.Count -ne 4) {
        throw "Each video must have exactly four gameplay clips."
    }

    switch ($Layout) {
        "landscape" { $width = 1920; $height = 1080 }
        "square"    { $width = 1080; $height = 1080 }
        "portrait"  { $width = 1080; $height = 1920 }
    }

    $args = @("-hide_banner", "-y", "-loglevel", "warning")
    foreach ($start in $Starts) {
        $args += @("-ss", "$start", "-t", "3", "-i", $master)
    }
    $args += @("-loop", "1", "-t", "3", "-i", (Join-Path $imageDir $EndCard))
    $args += @("-stream_loop", "-1", "-i", (Join-Path $musicDir $Music))

    $filters = @()
    for ($i = 0; $i -lt 4; $i++) {
        $filters += Get-ClipFilter -Index $i -Layout $Layout -Width $width -Height $height
    }
    $filters += Get-ClipFilter -Index 4 -Layout $Layout -Width $width -Height $height -IsEndCard $true
    $filters += "[v0][v1][v2][v3][v4]concat=n=5:v=1:a=0[vout]"
    $filters += "[5:a]atrim=duration=15,asetpts=PTS-STARTPTS,afade=t=in:st=0:d=0.20,afade=t=out:st=14:d=1,volume=1.20,alimiter=limit=0.95[aout]"

    $target = Join-Path $outputDir $Name
    $args += @(
        "-filter_complex", ($filters -join ";"),
        "-map", "[vout]", "-map", "[aout]",
        "-c:v", "libx264", "-preset", "medium", "-crf", "18",
        "-profile:v", "high", "-level", "4.1", "-pix_fmt", "yuv420p",
        "-r", "30", "-movflags", "+faststart",
        "-c:a", "aac", "-b:a", "192k", "-ar", "48000",
        "-t", "15", $target
    )

    Write-Host "Rendering $Name ..."
    & ffmpeg @args
    if ($LASTEXITCODE -ne 0) {
        throw "ffmpeg failed while rendering $Name"
    }
}

$videos = @(
    @{ Name = "landscape-01-boss-final-15s.mp4"; Layout = "landscape"; Starts = @(8, 18, 28, 38); EndCard = "landscape-02-se-viene-boss.png"; Music = "spectral-vanguard.ogg" },
    @{ Name = "landscape-02-aura-crossfire-15s.mp4"; Layout = "landscape"; Starts = @(57, 67, 77, 87); EndCard = "landscape-01-aura-crossfire.png"; Music = "neon-affinity.ogg" },
    @{ Name = "square-01-modo-dios-15s.mp4"; Layout = "square"; Starts = @(19, 39, 69, 99); EndCard = "square-01-modo-dios.png"; Music = "foundation-pulse.ogg" },
    @{ Name = "square-02-farmeando-aura-15s.mp4"; Layout = "square"; Starts = @(29, 59, 89, 109); EndCard = "square-04-farmeando-aura.png"; Music = "ion-islands.ogg" },
    @{ Name = "portrait-01-boss-final-15s.mp4"; Layout = "portrait"; Starts = @(17, 47, 77, 107); EndCard = "portrait-02-boss-final.png"; Music = "blizzard-relay.ogg" },
    @{ Name = "portrait-02-mil-builds-15s.mp4"; Layout = "portrait"; Starts = @(7, 37, 67, 97); EndCard = "portrait-06-mil-builds.png"; Music = "fortaleza-nebula.ogg" },
    @{ Name = "landscape-03-area-denegada-15s.mp4"; Layout = "landscape"; Starts = @(12, 42, 72, 102); EndCard = "landscape-03-area-denegada.png"; Music = "horizon-signal.ogg" },
    @{ Name = "landscape-04-cine-puro-15s.mp4"; Layout = "landscape"; Starts = @(24, 54, 84, 114); EndCard = "landscape-05-cine-puro.png"; Music = "pan-orbit-drive.ogg" },
    @{ Name = "landscape-05-full-send-15s.mp4"; Layout = "landscape"; Starts = @(15, 45, 75, 105); EndCard = "landscape-04-full-send.png"; Music = "moving-starward.ogg" },
    @{ Name = "landscape-06-build-roto-15s.mp4"; Layout = "landscape"; Starts = @(5, 35, 65, 95); EndCard = "landscape-06-build-roto.png"; Music = "past-the-nebula.ogg" },
    @{ Name = "landscape-07-boss-rush-15s.mp4"; Layout = "landscape"; Starts = @(31, 61, 91, 111); EndCard = "landscape-02-se-viene-boss.png"; Music = "slow-comet-highway.ogg" },
    @{ Name = "landscape-08-no-safe-orbit-15s.mp4"; Layout = "landscape"; Starts = @(2, 26, 50, 74); EndCard = "landscape-03-area-denegada.png"; Music = "homeward-signal.ogg" },
    @{ Name = "landscape-09-last-stand-15s.mp4"; Layout = "landscape"; Starts = @(10, 34, 58, 82); EndCard = "landscape-06-build-roto.png"; Music = "sunset-orbit.ogg" },
    @{ Name = "landscape-10-aura-overload-15s.mp4"; Layout = "landscape"; Starts = @(18, 42, 66, 90); EndCard = "landscape-01-aura-crossfire.png"; Music = "sunday-starway.ogg" },
    @{ Name = "landscape-11-cinematic-boss-15s.mp4"; Layout = "landscape"; Starts = @(22, 46, 70, 94); EndCard = "landscape-05-cine-puro.png"; Music = "ion-islands.ogg" },
    @{ Name = "landscape-12-chain-blast-15s.mp4"; Layout = "landscape"; Starts = @(30, 54, 78, 102); EndCard = "landscape-04-full-send.png"; Music = "neon-affinity.ogg" },
    @{ Name = "landscape-13-boss-phase-two-15s.mp4"; Layout = "landscape"; Starts = @(38, 62, 86, 110); EndCard = "landscape-02-se-viene-boss.png"; Music = "blizzard-relay.ogg" },
    @{ Name = "landscape-14-clutch-epico-15s.mp4"; Layout = "landscape"; Starts = @(6, 48, 88, 116); EndCard = "landscape-03-area-denegada.png"; Music = "foundation-pulse.ogg" },
    @{ Name = "landscape-15-ultimate-build-15s.mp4"; Layout = "landscape"; Starts = @(14, 56, 96, 104); EndCard = "landscape-06-build-roto.png"; Music = "spectral-vanguard.ogg" }
)

foreach ($video in $videos) {
    if ($Only.Count -gt 0 -and $Only -notcontains $video.Name) {
        continue
    }
    New-PromoVideo @video
}

Write-Host "Completed: $outputDir"
