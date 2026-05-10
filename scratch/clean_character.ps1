Add-Type -AssemblyName System.Drawing
$imgPath = "c:\Users\fbg67\Documents\GitHub\sankofa\kids\art\characters\vovo-sankofa\turnaround\01-MASTER-modelsheet-handmade.png"
$outPath = "c:\Users\fbg67\Documents\GitHub\sankofa\kids\art\characters\vovo-sankofa\turnaround\01-MASTER-modelsheet-handmade-CLEAN.png"

$img = [System.Drawing.Image]::FromFile($imgPath)
$width = $img.Width
$height = $img.Height

$bmp = new-object System.Drawing.Bitmap($img)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$brush = new-object System.Drawing.SolidBrush([System.Drawing.Color]::White)

# Left area (gold, terrocota wirings)
# Approximate coordinates based on 1024x1024
$g.FillRectangle($brush, 0, 150, 220, 250)

# Right area (deep, savanna, bone white)
# Approximate coordinates
$g.FillRectangle($brush, 800, 150, 224, 250)

$bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)

$g.Dispose()
$bmp.Dispose()
$img.Dispose()

Write-Host "Cleaned image saved to $outPath"
