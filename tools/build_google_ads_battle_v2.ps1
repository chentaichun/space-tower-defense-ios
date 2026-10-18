param(
    [string]$ProjectDir = (Split-Path -Parent $PSScriptRoot),
    [string]$MusicPath = "",
    [switch]$MasterOnly
)

$ErrorActionPreference = 'Stop'

$ffmpeg = (Get-Command ffmpeg -ErrorAction Stop).Source
$ffprobe = (Get-Command ffprobe -ErrorAction Stop).Source
$battleDir = Join-Path $ProjectDir 'store-assets\google-ads-battle-v2'
$webmPath = Join-Path $battleDir 'battle-master.webm'
$masterPath = Join-Path $battleDir 'battle-master.mp4'

if (-not (Test-Path -LiteralPath $webmPath)) {
    throw "Missing battle master recording: $webmPath"
}

New-Item -ItemType Directory -Force -Path $battleDir | Out-Null

Write-Host 'Converting the all-gameplay battle master to H.264...'
& $ffmpeg -hide_banner -loglevel error -y -i $webmPath -vf 'fps=30' -an -c:v libx264 -preset fast -crf 18 -pix_fmt yuv420p -movflags +faststart $masterPath
if ($LASTEXITCODE -ne 0) { throw 'Battle-master conversion failed.' }

if ($MasterOnly) {
    Write-Host "Master ready: $masterPath"
    exit 0
}

if ([string]::IsNullOrWhiteSpace($MusicPath)) {
    $MusicPath = Join-Path $ProjectDir 'assets\music\anime.ogg'
}
if (-not (Test-Path -LiteralPath $MusicPath)) {
    throw "Missing music file: $MusicPath"
}

$fontEn = 'C\:/Windows/Fonts/arialbd.ttf'
$fontZh = 'C\:/Windows/Fonts/msjhbd.ttc'
$seaDir = Join-Path $ProjectDir 'store-assets\google-ads-sea-en-battle-v2'
$zhDir = Join-Path $ProjectDir 'store-assets\google-ads-tw-hk-zh-battle-v2'
New-Item -ItemType Directory -Force -Path $seaDir, $zhDir | Out-Null

$formats = @(
    @{ Kind = 'landscape'; Width = 1920; Height = 1080; Count = 6 },
    @{ Kind = 'portrait'; Width = 1080; Height = 1920; Count = 3 },
    @{ Kind = 'square'; Width = 1080; Height = 1080; Count = 2 }
)

$seaHeadlines = @(
    'DEFEND THE GALAXY',
    'BUILD YOUR STRATEGY',
    'UPGRADE YOUR TOWERS',
    'CHOOSE YOUR TECH PATH',
    'SURVIVE EVERY WAVE',
    'HOLD THE LINE',
    'STACK YOUR UPGRADES',
    'CONTROL EVERY SECTOR',
    'BREAK THE MOTHERSHIP',
    'CLAIM THE STARS',
    'FINAL WAVE'
)

$zhHeadlines = @(
    '守護銀河',
    '打造你的戰術',
    '強化防禦塔',
    '選擇科技路線',
    '撐過每一波攻勢',
    '穩住防線',
    '疊加升級',
    '掌控每個戰區',
    '擊破母艦',
    '奪回星域',
    '最終波'
)

$starts = @(0, 6, 12, 18, 24, 30, 36, 42, 48, 54, 60)

function Get-FilterGraph {
    param(
        [string]$Kind,
        [int]$Width,
        [int]$Height,
        [string]$Font,
        [string]$Headline,
        [string]$EngineLabel,
        [string]$Cta
    )

    $safeHeadline = $Headline.Replace("'", "\\'")
    $safeEngine = $EngineLabel.Replace("'", "\\'")
    $safeCta = $Cta.Replace("'", "\\'")

    if ($Kind -eq 'landscape') {
        return @"
[0:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,setsar=1,
drawbox=x=0:y=28:w=iw:h=128:color=black@0.58:t=fill,
drawtext=fontfile='$Font':text='$safeHeadline':fontcolor=white:fontsize=62:borderw=3:bordercolor=black@0.9:x=(w-text_w)/2:y=58,
drawbox=x=0:y=958:w=iw:h=78:color=black@0.52:t=fill,
drawtext=fontfile='$Font':text='$safeEngine':fontcolor=0x7feaff:fontsize=25:borderw=2:bordercolor=black@0.9:x=(w-text_w)/2:y=982,
drawbox=x=690:y=810:w=540:h=104:color=0x07162b@0.86:t=fill:enable='gte(t,11.5)',
drawtext=fontfile='$Font':text='$safeCta':fontcolor=0xe8ff91:fontsize=54:borderw=3:bordercolor=black@0.95:x=(w-text_w)/2:y=832:enable='gte(t,11.5)'[v]
"@
    }

    if ($Kind -eq 'portrait') {
        return @"
[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,
drawbox=x=0:y=70:w=iw:h=200:color=black@0.62:t=fill,
drawtext=fontfile='$Font':text='$safeHeadline':fontcolor=white:fontsize=60:borderw=3:bordercolor=black@0.9:x=(w-text_w)/2:y=126,
drawbox=x=0:y=1600:w=iw:h=92:color=black@0.54:t=fill,
drawtext=fontfile='$Font':text='$safeEngine':fontcolor=0x7feaff:fontsize=26:borderw=2:bordercolor=black@0.9:x=(w-text_w)/2:y=1631,
drawbox=x=220:y=1720:w=640:h=120:color=0x07162b@0.88:t=fill:enable='gte(t,11.5)',
drawtext=fontfile='$Font':text='$safeCta':fontcolor=0xe8ff91:fontsize=58:borderw=3:bordercolor=black@0.95:x=(w-text_w)/2:y=1748:enable='gte(t,11.5)'[v]
"@
    }

    return @"
[0:v]scale=1080:1080:force_original_aspect_ratio=increase,crop=1080:1080,setsar=1,
drawbox=x=0:y=28:w=iw:h=142:color=black@0.62:t=fill,
drawtext=fontfile='$Font':text='$safeHeadline':fontcolor=white:fontsize=52:borderw=3:bordercolor=black@0.9:x=(w-text_w)/2:y=66,
drawbox=x=0:y=880:w=iw:h=72:color=black@0.54:t=fill,
drawtext=fontfile='$Font':text='$safeEngine':fontcolor=0x7feaff:fontsize=23:borderw=2:bordercolor=black@0.9:x=(w-text_w)/2:y=902,
drawbox=x=280:y=956:w=520:h=88:color=0x07162b@0.88:t=fill:enable='gte(t,11.5)',
drawtext=fontfile='$Font':text='$safeCta':fontcolor=0xe8ff91:fontsize=46:borderw=3:bordercolor=black@0.95:x=(w-text_w)/2:y=972:enable='gte(t,11.5)'[v]
"@
}

function Render-Locale {
    param(
        [string]$Locale,
        [string]$OutputDir,
        [string[]]$Headlines,
        [string]$Font,
        [string]$EngineLabel,
        [string]$Cta
    )

    $index = 0
    foreach ($format in $formats) {
        for ($variant = 1; $variant -le $format.Count; $variant += 1) {
            $headline = $Headlines[$index]
            $start = $starts[$index]
            $name = '{0}-{1}-{2:D2}.mp4' -f $Locale, $format.Kind, $variant
            $outputPath = Join-Path $OutputDir $name
            $filterGraph = Get-FilterGraph -Kind $format.Kind -Width $format.Width -Height $format.Height -Font $Font -Headline $headline -EngineLabel $EngineLabel -Cta $Cta

            Write-Host ("Rendering {0} from battle master at {1}s..." -f $name, $start)
            & $ffmpeg -hide_banner -loglevel error -y -ss $start -t 15 -i $masterPath -stream_loop -1 -i $MusicPath -filter_complex $filterGraph -map '[v]' -map '1:a:0' -t 15 -r 30 -c:v libx264 -preset veryfast -crf 20 -pix_fmt yuv420p -c:a aac -b:a 160k -af 'afade=t=in:st=0:d=0.35,afade=t=out:st=14.2:d=0.8' -movflags +faststart -shortest $outputPath
            if ($LASTEXITCODE -ne 0) { throw "Render failed: $name" }
            $index += 1
        }
    }
}

Render-Locale -Locale 'sea-en' -OutputDir $seaDir -Headlines $seaHeadlines -Font $fontEn -EngineLabel 'ACTUAL GAME ENGINE - HIGH-WAVE SIMULATION' -Cta 'PLAY NOW'
Render-Locale -Locale 'tw-hk-zh' -OutputDir $zhDir -Headlines $zhHeadlines -Font $fontZh -EngineLabel '實際遊戲引擎 - 高波次模擬' -Cta '立即遊玩'

Write-Host 'Verifying output streams and full decodes...'
$allVideos = @(Get-ChildItem -LiteralPath $seaDir, $zhDir -Filter '*.mp4' -File | Sort-Object FullName)
if ($allVideos.Count -ne 22) {
    throw "Expected 22 videos, found $($allVideos.Count)."
}

foreach ($video in $allVideos) {
    $probe = & $ffprobe -v error -show_entries 'format=duration' -show_entries 'stream=index,codec_name,width,height,pix_fmt' -of json $video.FullName | ConvertFrom-Json
    $videoStream = @($probe.streams | Where-Object { $_.codec_name -eq 'h264' })[0]
    $audioStream = @($probe.streams | Where-Object { $_.codec_name -eq 'aac' })[0]
    $seconds = [double]$probe.format.duration
    if (-not $videoStream -or -not $audioStream -or $videoStream.pix_fmt -ne 'yuv420p' -or [Math]::Abs($seconds - 15.0) -gt 0.15) {
        throw "Stream verification failed: $($video.FullName)"
    }
    & $ffmpeg -v error -i $video.FullName -f null NUL
    if ($LASTEXITCODE -ne 0) { throw "Full decode failed: $($video.FullName)" }
}

Write-Host "READY SEA=$seaDir ZH=$zhDir COUNT=$($allVideos.Count)"
