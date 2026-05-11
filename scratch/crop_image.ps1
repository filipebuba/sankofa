Add-Type -AssemblyName System.Drawing
$imgPath = "c:\Users\fbg67\Documents\GitHub\sankofa\kids\art\backgrounds\ep1-noite-fogueira-MASTER.png"
$outPath = "c:\Users\fbg67\Documents\GitHub\sankofa\kids\art\backgrounds\ep1-noite-fogueira-CLEAN.png"

$img = [System.Drawing.Image]::FromFile($imgPath)
$width = $img.Width
$height = $img.Height

# The bar looks to be about 10-15% of the image. 
# Let's try to remove 80 pixels or calculate it based on the white background.
# Based on the image preview, the bar is white with text.
# Let's try to crop the bottom 100 pixels as a safe guess, or we could be more precise.
# Let's use 924 as the new height if the original is 1024.
$newHeight = $height - 90 

$bmp = new-object System.Drawing.Bitmap($width, $newHeight)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$srcRect = new-object System.Drawing.Rectangle(0, 0, $width, $newHeight)
$destRect = new-object System.Drawing.Rectangle(0, 0, $width, $newHeight)

$g.DrawImage($img, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)

$bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)

$g.Dispose()
$bmp.Dispose()
$img.Dispose()

Write-Host "Image saved to $outPath"
