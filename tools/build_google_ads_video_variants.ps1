param(
  [string]$AssetRoot = (Join-Path $PSScriptRoot '..\store-assets')
)

$ErrorActionPreference = 'Stop'

$imageDir = Join-Path $AssetRoot 'google-ads-latam-es-test01'
$audioSource = Join-Path $AssetRoot 'google-ads-latam-es-test01-videos-v1\landscape-01-boss-final-15s.mp4'
$englishOut = Join-Path $AssetRoot 'google-ads-sea-en-wave1'
$chineseOut = Join-Path $AssetRoot 'google-ads-tw-hk-zh-wave1'

function Build-Variant {
  param(
    [string[]]$Images,
    [int]$Width,
    [int]$Height,
    [string]$Output,
    [string]$FontFile,
    [string[]]$Messages,
    [string]$GameName
  )

  $inputs = @()
  foreach ($image in $Images) {
    $inputs += '-loop', '1', '-t', '3', '-i', (Join-Path $imageDir $image)
  }
  $inputs += '-i', $audioSource

  $filters = @()
  for ($i = 0; $i -lt 5; $i++) {
    $panX = if (($i % 2) -eq 0) { "iw/2-(iw/zoom/2)" } else { "iw/2-(iw/zoom/2)+12*sin(on/18)" }
    $filters += "[$i`:v]scale=$Width`:$Height`:force_original_aspect_ratio=increase,crop=$Width`:$Height,setsar=1,format=yuv420p,zoompan=z='min(zoom+0.00055,1.055)':x='$panX':y='ih/2-(ih/zoom/2)':d=90:s=${Width}x${Height}:fps=30[v$i]"
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
    '-map', '[outv]', '-map', '5:a:0', '-t', '15', '-r', '30',
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p',
    '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', $Output
  )

  & ffmpeg @args
  if ($LASTEXITCODE -ne 0) { throw "ffmpeg failed for $Output" }
}

$sets = @(
  @{ Name = 'landscape-v2'; Width = 1920; Height = 1080; Images = @('landscape-06-gravity-vortex.png','landscape-02-final-boss.png','landscape-07-emp-crystal.png','landscape-04-drone-chain-blast.png','landscape-05-mothership-siege.png') },
  @{ Name = 'landscape-v3'; Width = 1920; Height = 1080; Images = @('landscape-07-emp-crystal.png','landscape-01-orbital-crossfire.png','landscape-06-gravity-vortex.png','landscape-03-emp-frost.png','landscape-02-final-boss.png') },
  @{ Name = 'landscape-v4'; Width = 1920; Height = 1080; Images = @('landscape-05-mothership-siege.png','landscape-06-gravity-vortex.png','landscape-04-drone-chain-blast.png','landscape-07-emp-crystal.png','landscape-01-orbital-crossfire.png') },
  @{ Name = 'landscape-v5'; Width = 1920; Height = 1080; Images = @('landscape-03-emp-frost.png','landscape-07-emp-crystal.png','landscape-02-final-boss.png','landscape-06-gravity-vortex.png','landscape-05-mothership-siege.png') },
  @{ Name = 'landscape-v6'; Width = 1920; Height = 1080; Images = @('landscape-04-drone-chain-blast.png','landscape-01-orbital-crossfire.png','landscape-07-emp-crystal.png','landscape-05-mothership-siege.png','landscape-06-gravity-vortex.png') },
  @{ Name = 'square-v2'; Width = 1080; Height = 1080; Images = @('square-06-prismatic-shield.png','square-01-orbital-crossfire.png','square-07-mothership-crack.png','square-03-emp-frost.png','square-04-drone-chain-blast.png') },
  @{ Name = 'square-v3'; Width = 1080; Height = 1080; Images = @('square-07-mothership-crack.png','square-04-drone-chain-blast.png','square-06-prismatic-shield.png','square-02-final-boss.png','square-05-mothership-siege.png') },
  @{ Name = 'portrait-v2'; Width = 1080; Height = 1920; Images = @('portrait-06-orbital-gauntlet.png','portrait-01-orbital-crossfire.png','portrait-05-mothership-siege.png','portrait-03-emp-frost.png','portrait-02-final-boss.png') },
  @{ Name = 'portrait-v3'; Width = 1080; Height = 1920; Images = @('portrait-02-final-boss.png','portrait-06-orbital-gauntlet.png','portrait-04-drone-chain-blast.png','portrait-01-orbital-crossfire.png','portrait-05-mothership-siege.png') }
)

$englishMessages = @('HOLD THE LINE','STACK YOUR UPGRADES','CONTROL EVERY SECTOR','BREAK THE MOTHERSHIP','CLAIM THE STARS')
$chineseMessages = @('穩住防線','疊加升級','控制每個戰區','擊破母艦','奪回星域')

foreach ($set in $sets) {
  Build-Variant -Images $set.Images -Width $set.Width -Height $set.Height -Output (Join-Path $englishOut "$($set.Name)-localized-15s.mp4") -FontFile 'C:\Windows\Fonts\arialbd.ttf' -Messages $englishMessages -GameName 'SPACE TOWER DEFENSE'
  Build-Variant -Images $set.Images -Width $set.Width -Height $set.Height -Output (Join-Path $chineseOut "$($set.Name)-localized-15s.mp4") -FontFile 'C:\Windows\Fonts\msjhbd.ttc' -Messages $chineseMessages -GameName '太空塔防'
}

Write-Output 'Created four additional localized video variants per market.'
