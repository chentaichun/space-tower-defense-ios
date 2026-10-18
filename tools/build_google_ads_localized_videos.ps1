param(
  [string]$AssetRoot = (Join-Path $PSScriptRoot '..\store-assets')
)

$ErrorActionPreference = 'Stop'

$sourceDir = Join-Path $AssetRoot 'google-ads-latam-es-test01'
$audioSource = Join-Path $AssetRoot 'google-ads-latam-es-test01-videos-v1\landscape-01-boss-final-15s.mp4'
$englishOut = Join-Path $AssetRoot 'google-ads-sea-en-wave1'
$chineseOut = Join-Path $AssetRoot 'google-ads-tw-hk-zh-wave1'

New-Item -ItemType Directory -Force -Path $englishOut, $chineseOut | Out-Null

function Build-LocalizedVideo {
  param(
    [string]$Prefix,
    [int]$Width,
    [int]$Height,
    [string]$Output,
    [string]$FontFile,
    [string[]]$Messages,
    [string]$GameName
  )

  $inputs = @()
  for ($i = 1; $i -le 5; $i++) {
    $name = switch ($i) {
      1 { 'orbital-crossfire' }
      2 { 'final-boss' }
      3 { 'emp-frost' }
      4 { 'drone-chain-blast' }
      5 { 'mothership-siege' }
    }
    $inputs += '-loop', '1', '-t', '3', '-i', (Join-Path $sourceDir (('{0}-{1:d2}-{2}.png' -f $Prefix, $i, $name)))
  }
  $inputs += '-i', $audioSource

  $filters = @()
  for ($i = 0; $i -lt 5; $i++) {
    $filters += "[$i`:v]scale=$Width`:$Height`:force_original_aspect_ratio=increase,crop=$Width`:$Height,setsar=1,format=yuv420p,zoompan=z='min(zoom+0.00045,1.045)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=90:s=${Width}x${Height}:fps=30[v$i]"
  }

  $video = '[v0][v1][v2][v3][v4]concat=n=5:v=1:a=0[base]'
  $topHeight = [math]::Round($Height * 0.16)
  $topY = [math]::Round($Height * 0.045)
  $fontSize = [math]::Round([math]::Min($Width, $Height) * 0.068)
  $gameFontSize = [math]::Round([math]::Min($Width, $Height) * 0.036)
  $bottomY = [math]::Round($Height * 0.91)
  $fontForFilter = $FontFile.Replace('\', '/').Replace(':', '\:')

  $video += ";[base]drawbox=x=0:y=0:w=iw:h=$topHeight`:color=black@0.58:t=fill"
  for ($i = 0; $i -lt 5; $i++) {
    $start = $i * 3
    $end = $start + 2.99
    $video += ",drawtext=fontfile='$fontForFilter':text='$($Messages[$i])':fontcolor=white:fontsize=$fontSize`:x=(w-text_w)/2:y=$topY`:borderw=3:bordercolor=black@0.75:enable='between(t,$start,$end)'"
  }
  $video += ",drawbox=x=0:y=ih-$([math]::Round($Height * 0.105))`:w=iw:h=$([math]::Round($Height * 0.105))`:color=black@0.5:t=fill"
  $video += ",drawtext=fontfile='$fontForFilter':text='$GameName':fontcolor=0x72E9FF:fontsize=$gameFontSize`:x=(w-text_w)/2:y=$bottomY`:borderw=2:bordercolor=black@0.8[outv]"
  $filters += $video

  $args = @('-hide_banner', '-loglevel', 'warning', '-y') + $inputs + @(
    '-filter_complex', ($filters -join ';'),
    '-map', '[outv]', '-map', '5:a:0',
    '-t', '15', '-r', '30',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-pix_fmt', 'yuv420p',
    '-c:a', 'aac', '-b:a', '128k',
    '-movflags', '+faststart',
    $Output
  )

  & ffmpeg @args
  if ($LASTEXITCODE -ne 0) { throw "ffmpeg failed for $Output" }
}

$englishMessages = @(
  'DEFEND THE GALAXY',
  'BUILD YOUR STRATEGY',
  'UPGRADE YOUR TOWERS',
  'CHOOSE YOUR TECH PATH',
  'SURVIVE EVERY WAVE'
)

$chineseMessages = @(
  '守護銀河',
  '打造你的戰術',
  '強化防禦塔',
  '選擇科技路線',
  '撐過每一波攻勢'
)

$formats = @(
  @{ Prefix = 'landscape'; Width = 1920; Height = 1080; File = 'landscape-localized-15s.mp4' },
  @{ Prefix = 'square'; Width = 1080; Height = 1080; File = 'square-localized-15s.mp4' },
  @{ Prefix = 'portrait'; Width = 1080; Height = 1920; File = 'portrait-localized-15s.mp4' }
)

foreach ($format in $formats) {
  $baseParams = @{
    Prefix = $format.Prefix
    Width = $format.Width
    Height = $format.Height
  }
  Build-LocalizedVideo @baseParams -Output (Join-Path $englishOut $format.File) -FontFile 'C:\Windows\Fonts\arialbd.ttf' -Messages $englishMessages -GameName 'SPACE TOWER DEFENSE'
  Build-LocalizedVideo @baseParams -Output (Join-Path $chineseOut $format.File) -FontFile 'C:\Windows\Fonts\msjhbd.ttc' -Messages $chineseMessages -GameName '太空塔防'
}

Write-Output "Created localized Google Ads videos in:`n$englishOut`n$chineseOut"
