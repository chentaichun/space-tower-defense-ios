param(
    [string]$ProjectDir = (Split-Path -Parent $PSScriptRoot),
    [string]$MusicPath = ""
)

$ErrorActionPreference = 'Stop'

$ffmpeg = (Get-Command ffmpeg -ErrorAction Stop).Source
$ffprobe = (Get-Command ffprobe -ErrorAction Stop).Source
$python = (Get-Command py -ErrorAction Stop).Source
$masterPath = Join-Path $ProjectDir 'store-assets\google-ads-battle-v2\battle-master.mp4'
$outputDir = Join-Path $ProjectDir 'store-assets\google-ads-high-value-en-battle-v1'
$voiceDir = Join-Path $outputDir 'voice'
$qaDir = Join-Path $outputDir 'qa'

if (-not (Test-Path -LiteralPath $masterPath)) {
    throw "Missing gameplay master: $masterPath"
}
if ([string]::IsNullOrWhiteSpace($MusicPath)) {
    $MusicPath = Join-Path $ProjectDir 'assets\music\rock.ogg'
}
if (-not (Test-Path -LiteralPath $MusicPath)) {
    throw "Missing music file: $MusicPath"
}

New-Item -ItemType Directory -Force -Path $outputDir, $voiceDir, $qaDir | Out-Null

$voiceScripts = @(
    @{ Name = 'voice-01'; Text = "They're everywhere! Build faster, upgrade harder, and blast through the final wave. Can your tower survive?" },
    @{ Name = 'voice-02'; Text = 'The galaxy is collapsing! Stack insane upgrades, unleash orbital fire, and destroy the mothership. Play now!' },
    @{ Name = 'voice-03'; Text = 'One core. Endless enemies. Zero mercy. Build the ultimate space tower and hold the line!' }
)

foreach ($voice in $voiceScripts) {
    $voicePath = Join-Path $voiceDir ($voice.Name + '.mp3')
    Write-Host ("Generating energetic English voice-over: {0}" -f $voice.Name)
    & $python -m edge_tts --voice 'en-US-ChristopherNeural' --rate '+28%' --volume '+12%' --pitch '+10Hz' --text $voice.Text --write-media $voicePath
    if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $voicePath)) {
        throw "Voice generation failed: $voicePath"
    }
}

$formats = @(
    @{ Kind = 'landscape'; Width = 1920; Height = 1080; Count = 6 },
    @{ Kind = 'portrait'; Width = 1080; Height = 1920; Count = 3 },
    @{ Kind = 'square'; Width = 1080; Height = 1080; Count = 2 }
)

$headlines = @(
    'THEY ARE EVERYWHERE!',
    'BUILD. BLAST. SURVIVE.',
    'UNLEASH ORBITAL CHAOS',
    'THE FINAL WAVE IS HERE',
    'DESTROY THE MOTHERSHIP',
    'CAN YOUR TOWER SURVIVE?',
    'ENDLESS ENEMIES. ONE CORE.',
    'STACK INSANE UPGRADES',
    'ZERO MERCY. HOLD THE LINE.',
    'DEFEND THE GALAXY',
    'HOW FAR CAN YOU GO?'
)

$starts = @(2, 10, 18, 26, 34, 42, 8, 24, 40, 14, 36)
$voiceMap = @(1, 2, 3, 1, 2, 3, 1, 2, 3, 2, 1)
$font = 'C\:/Windows/Fonts/arialbd.ttf'

function Get-VideoFilter {
    param(
        [string]$Kind,
        [string]$Headline
    )

    $safeHeadline = $Headline.Replace("'", "\\'")
    $base = if ($Kind -eq 'landscape') {
        "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080"
    } elseif ($Kind -eq 'portrait') {
        "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920"
    } else {
        "scale=1080:1080:force_original_aspect_ratio=increase,crop=1080:1080"
    }

    if ($Kind -eq 'landscape') {
        return @"
[0:v]$base,setsar=1,eq=saturation=1.42:contrast=1.10:brightness=0.025,
drawbox=x=0:y=0:w=iw:h=176:color=0x100023@0.62:t=fill,
drawbox=x=0:y=176:w=iw:h=7:color=0x00f5ff@0.88:t=fill,
drawtext=fontfile='$font':text='$safeHeadline':fontcolor=white:fontsize=72:borderw=5:bordercolor=0x31005f@0.95:x=(w-text_w)/2:y=52:enable='between(t,0.25,4.6)',
drawtext=fontfile='$font':text='ACTUAL GAME ENGINE  /  HIGH-WAVE SIMULATION':fontcolor=0x8dfcff:fontsize=24:borderw=2:bordercolor=black@0.95:x=42:y=h-54,
drawbox=x=620:y=875:w=680:h=118:color=0xff1f9a@0.88:t=fill:enable='gte(t,11.2)',
drawtext=fontfile='$font':text='PLAY FREE NOW':fontcolor=white:fontsize=66:borderw=4:bordercolor=0x42002b@0.95:x=(w-text_w)/2:y=899:enable='gte(t,11.2)',
fade=t=in:st=0:d=0.12,fade=t=out:st=14.65:d=0.35[v]
"@
    }

    if ($Kind -eq 'portrait') {
        return @"
[0:v]$base,setsar=1,eq=saturation=1.48:contrast=1.12:brightness=0.03,
drawbox=x=0:y=0:w=iw:h=300:color=0x100023@0.66:t=fill,
drawbox=x=0:y=300:w=iw:h=9:color=0x00f5ff@0.9:t=fill,
drawtext=fontfile='$font':text='$safeHeadline':fontcolor=white:fontsize=68:borderw=5:bordercolor=0x31005f@0.95:x=(w-text_w)/2:y=104:enable='between(t,0.25,4.6)',
drawtext=fontfile='$font':text='ACTUAL GAME ENGINE':fontcolor=0x8dfcff:fontsize=26:borderw=2:bordercolor=black@0.95:x=(w-text_w)/2:y=1620,
drawbox=x=150:y=1690:w=780:h=145:color=0xff1f9a@0.90:t=fill:enable='gte(t,11.2)',
drawtext=fontfile='$font':text='PLAY FREE NOW':fontcolor=white:fontsize=72:borderw=4:bordercolor=0x42002b@0.95:x=(w-text_w)/2:y=1725:enable='gte(t,11.2)',
fade=t=in:st=0:d=0.12,fade=t=out:st=14.65:d=0.35[v]
"@
    }

    return @"
[0:v]$base,setsar=1,eq=saturation=1.46:contrast=1.11:brightness=0.03,
drawbox=x=0:y=0:w=iw:h=196:color=0x100023@0.65:t=fill,
drawbox=x=0:y=196:w=iw:h=8:color=0x00f5ff@0.9:t=fill,
drawtext=fontfile='$font':text='$safeHeadline':fontcolor=white:fontsize=58:borderw=4:bordercolor=0x31005f@0.95:x=(w-text_w)/2:y=68:enable='between(t,0.25,4.6)',
drawtext=fontfile='$font':text='ACTUAL GAME ENGINE':fontcolor=0x8dfcff:fontsize=23:borderw=2:bordercolor=black@0.95:x=30:y=1040,
drawbox=x=180:y=896:w=720:h=116:color=0xff1f9a@0.90:t=fill:enable='gte(t,11.2)',
drawtext=fontfile='$font':text='PLAY FREE NOW':fontcolor=white:fontsize=58:borderw=4:bordercolor=0x42002b@0.95:x=(w-text_w)/2:y=920:enable='gte(t,11.2)',
fade=t=in:st=0:d=0.12,fade=t=out:st=14.65:d=0.35[v]
"@
}

$index = 0
foreach ($format in $formats) {
    for ($variant = 1; $variant -le $format.Count; $variant += 1) {
        $headline = $headlines[$index]
        $start = $starts[$index]
        $voiceIndex = $voiceMap[$index]
        $voicePath = Join-Path $voiceDir ('voice-{0:D2}.mp3' -f $voiceIndex)
        $name = 'high-value-en-{0}-{1:D2}.mp4' -f $format.Kind, $variant
        $outputPath = Join-Path $outputDir $name
        $videoFilter = Get-VideoFilter -Kind $format.Kind -Headline $headline

        Write-Host ("Rendering {0} from {1}s with voice {2}..." -f $name, $start, $voiceIndex)
        & $ffmpeg -hide_banner -loglevel error -y `
            -ss $start -t 15 -i $masterPath `
            -stream_loop -1 -i $MusicPath `
            -i $voicePath `
            -filter_complex "$videoFilter;[1:a]atrim=0:15,volume=0.24,afade=t=in:st=0:d=0.2,afade=t=out:st=14.3:d=0.7[music];[2:a]adelay=650|650,volume=1.65,acompressor=threshold=0.06:ratio=3:attack=5:release=80[voice];[music][voice]amix=inputs=2:duration=first:dropout_transition=0,loudnorm=I=-14:TP=-1.5:LRA=7,alimiter=limit=0.94[a]" `
            -map '[v]' -map '[a]' -t 15 -r 30 `
            -c:v libx264 -preset veryfast -crf 19 -pix_fmt yuv420p `
            -c:a aac -b:a 192k -movflags +faststart -shortest $outputPath
        if ($LASTEXITCODE -ne 0) { throw "Render failed: $name" }
        $index += 1
    }
}

Write-Host 'Verifying all High Value EN assets...'
$videos = @(Get-ChildItem -LiteralPath $outputDir -Filter 'high-value-en-*.mp4' -File | Sort-Object Name)
if ($videos.Count -ne 11) { throw "Expected 11 videos, found $($videos.Count)." }

foreach ($video in $videos) {
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

$contactSheet = Join-Path $qaDir 'high-value-en-contact-sheet.jpg'
$inputs = @()
$filters = @()
for ($i = 0; $i -lt $videos.Count; $i += 1) {
    $inputs += @('-ss', '5.0', '-i', $videos[$i].FullName)
    $filters += "[$i`:v]scale=480:-2,drawtext=fontfile='$font':text='$($videos[$i].BaseName)':fontcolor=white:fontsize=18:borderw=2:bordercolor=black:x=12:y=12[t$i]"
}
$labels = (0..($videos.Count - 1) | ForEach-Object { "[t$_]" }) -join ''
$filter = ($filters -join ';') + ";$labels" + "xstack=inputs=$($videos.Count):layout=0_0|480_0|960_0|1440_0|0_270|480_270|960_270|1440_270|0_540|480_540|960_540:fill=black[out]"
& $ffmpeg -hide_banner -loglevel error -y @inputs -filter_complex $filter -map '[out]' -frames:v 1 -q:v 2 $contactSheet
if ($LASTEXITCODE -ne 0) { throw 'Contact-sheet generation failed.' }

Write-Host "READY HIGH_VALUE_EN=$outputDir COUNT=$($videos.Count) QA=$contactSheet"
