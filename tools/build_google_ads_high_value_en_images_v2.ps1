param(
    [string]$ProjectRoot = "C:\Users\User\space_tower_defense"
)

$ErrorActionPreference = "Stop"

$generatedRoot = "C:\Users\User\.codex\generated_images\01a06149-9d37-7461-b14a-377036561f84"
$outputRoot = Join-Path $ProjectRoot "store-assets\google-ads-high-value-en-images-v2"
New-Item -ItemType Directory -Force -Path $outputRoot | Out-Null

$creatives = @(
    @{ Slug = "god-mode"; Source = "exec-9a5a9666-6401-4232-aeab-ddcecf00f38b.png" },
    @{ Slug = "laser-overload"; Source = "exec-2aad8710-d7ac-4c5e-a575-8d682f33568c.png" },
    @{ Slug = "destroy-the-mothership"; Source = "exec-142c1317-3d71-475c-a2ca-662ae87e51d0.png" },
    @{ Slug = "no-mercy"; Source = "exec-c54e6f6d-88b1-4ad4-8677-d478106bbd8d.png" },
    @{ Slug = "survive-the-final-wave"; Source = "exec-b1608e37-4ca9-45f2-aee8-6389dea27a5b.png" },
    @{ Slug = "power-up"; Source = "exec-1b4faa16-64bf-45a2-8adc-061507d492b5.png" },
    @{ Slug = "one-core-endless-enemies"; Source = "exec-d9ec3589-bb10-4fa1-a07f-04b507762b63.png" }
)

$formats = @(
    @{ Name = "landscape"; Width = 1920; Height = 1080 },
    @{ Name = "portrait"; Width = 1080; Height = 1920 },
    @{ Name = "square"; Width = 1200; Height = 1200 }
)

foreach ($creative in $creatives) {
    $source = Join-Path $generatedRoot $creative.Source
    if (-not (Test-Path -LiteralPath $source)) {
        throw "Missing generated source: $source"
    }

    foreach ($format in $formats) {
        $output = Join-Path $outputRoot ("{0}-{1}.png" -f $creative.Slug, $format.Name)
        $filter = "split=2[bg][fg];[bg]scale=$($format.Width):$($format.Height):force_original_aspect_ratio=increase,crop=$($format.Width):$($format.Height),gblur=sigma=36[bg2];[fg]scale=$($format.Width):$($format.Height):force_original_aspect_ratio=decrease[fg2];[bg2][fg2]overlay=(W-w)/2:(H-h)/2,format=rgb24"
        & ffmpeg -hide_banner -loglevel error -y -i $source -filter_complex $filter -frames:v 1 $output
        if ($LASTEXITCODE -ne 0) {
            throw "ffmpeg failed for $output"
        }
    }
}

$files = Get-ChildItem -LiteralPath $outputRoot -File -Filter *.png | Sort-Object Name
Write-Output ("Created {0} image assets in {1}" -f $files.Count, $outputRoot)
$files | ForEach-Object { Write-Output $_.FullName }
