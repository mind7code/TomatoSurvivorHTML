param(
  [string]$SourceDirectory = 'C:\Users\1124143\AppData\Local\Temp',
  [string]$OutputDirectory = (Join-Path $PSScriptRoot '..\assets\weapons')
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$sources = [ordered]@{
  knife='49bb1bbe-d21d-4487-bb40-c464b389d33d'; dagger='06b93c5e-7705-48b2-b8a8-7086377a5de7'; shortSword='9e55ba6a-88b3-4290-a805-d3aa04839792'; longSword='0c32d2d8-df91-47a9-91f4-50758ee0b31f'; katana='849b2a43-c171-4c84-b1ff-ab4d4b0d0b8a'; heavySword='0afa5d69-a50a-4db7-a6f3-cf08b30fc568'; axe='272f5c75-a0c5-40b0-8d1c-652798f8b0eb'; doubleAxe='abece5a8-5ea6-47fa-b781-147ccdabb116'; spear='db0a4e00-df51-43b1-aa51-92fb2bfcf4a5'; hammer='b317efdd-90fe-401f-ba0f-ea758fe968f8'
  pistol='b981c0a9-9566-4e76-8b9e-1aacdf5c95e8'; autoPistol='3dd1ac47-9503-405b-8e17-650ffd7cad9f'; revolver='fbf818e1-f6f8-4457-8ef2-0ad58fa6b910'; smg='48aa6be5-e3af-4938-a975-264732c89653'; shotgun='9dc4aadc-2cd3-4b68-a224-cd080a09bcb1'; autoShotgun='b24b94d5-798f-430b-8a1e-9d53edd67f49'; rifle='a41f8ac3-23e7-441b-8caa-94d14ad1fa90'; assaultRifle='d86b764b-3a23-4127-85f6-3472f86e22ae'; sniper='38c34ae9-95d7-43c0-ac9b-0ce1ea53fe7a'; machineGun='dc6a9e75-1559-4b59-8560-3557f5467eeb'
  cleaver='49bb1bbe-d21d-4487-bb40-c464b389d33d'; scythe='9ea5db46-249d-4fd2-bf76-51743e3e617b'; trident='4201b176-bbc4-4170-b442-7838b44db519'; chainsaw='b96b7f86-289b-4aa9-8fe2-2a895135ac94'; plasmaPistol='963e2aa8-0e94-4d86-bbd4-34b6bcda562d'; crossbow='0eec87ff-5308-407c-b557-9aa29ccfebde'; grenadeLauncher='1c40514f-e4bc-4ad4-aaf5-b4d7e8d9e7bb'; flamethrower='1f69a568-1e36-4ecf-8c45-06e64adc5aeb'; gardenFork='4201b176-bbc4-4170-b442-7838b44db519'; pruningShears='242c80f8-dad3-46ed-9c15-a85650d7d5fa'
  hoe='88001812-f107-4de3-b433-c88fe48dfc19'; rake='0e34a9a7-2546-4472-9bda-c029c9b31023'; gardenWhip='07411a86-3cef-4421-942f-bc5694992b59'; fryingPan='ab6bbc11-1a9b-4171-8467-f74751d73ccc'; broom='a82b2e72-8c81-4ac5-bf9c-dfd68a411c1b'; rollingPin='d1e0be0a-3f31-4fa0-8729-97198446b94c'; umbrella='40cd15ae-0b97-4eb5-92f7-f0b0e4c670a5'; shovel='aacfa3f4-f8aa-4f98-b883-13996880ef2b'; peaShooter='95d3b770-355d-40c2-8244-cc5a14b71f3f'; seedCannon='03df5ddd-c3d9-4475-a0c1-4dd411260d15'
  waterGun='f8e66dc0-6328-40c3-9409-d803b3db1019'; leafBlower='11c63681-d14a-4ec6-99a0-529ed38af988'; nailGun='6f0a6013-c7ce-4e7c-b21d-0d5f1859faba'; slingshot='51f69fd4-3e88-4f29-805a-a8c4530b40a5'; bubbleBlaster='a8a1cb4b-2a15-4de1-b70a-22e70ffb1a6d'; thornSprayer='871f4b11-a0ce-4289-9b8b-7adb9ba1253d'; solarRay='fcce2d19-b3d2-45fc-b5ef-12bf8d182c45'; compostMortar='ad2148d8-3fe4-44ff-a5ec-7d6fb7cbf896'; minigun='9540a2b1-875e-4e18-96c2-6adcfbd3b161'
}

New-Item -ItemType Directory -Force -Path $OutputDirectory | Out-Null
foreach($entry in $sources.GetEnumerator()) {
  $output=Join-Path $OutputDirectory "$($entry.Key).png"
  if(Test-Path -LiteralPath $output) { continue }
  $input = Join-Path $SourceDirectory ("codex-clipboard-$($entry.Value).png")
  if(-not (Test-Path -LiteralPath $input)) { throw "Imagem ausente: $input" }
  $source = [System.Drawing.Bitmap]::new($input)
  # 128 px mantém o sprite nítido no tamanho usado na arena e reduz o carregamento.
  $size = 128
  $sprite = [System.Drawing.Bitmap]::new($size,$size,[System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($sprite)
  $graphics.Clear([System.Drawing.Color]::Transparent)
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.DrawImage($source,0,0,$size,$size)
  $graphics.Dispose(); $source.Dispose()
  $body = New-Object 'bool[,]' $size,$size
  for($y=0;$y -lt $size;$y++){for($x=0;$x -lt $size;$x++){
    $pixel=$sprite.GetPixel($x,$y); $lum=($pixel.R+$pixel.G+$pixel.B)/3; $spread=[Math]::Max($pixel.R,[Math]::Max($pixel.G,$pixel.B))-[Math]::Min($pixel.R,[Math]::Min($pixel.G,$pixel.B))
    $body[$x,$y]=($lum -gt 88 -or ($lum -gt 58 -and $spread -gt 55))
  }}
  for($y=0;$y -lt $size;$y++){for($x=0;$x -lt $size;$x++){
    $pixel=$sprite.GetPixel($x,$y); $keep=$body[$x,$y]
    if(-not $keep){ for($dy=-2;$dy -le 2 -and -not $keep;$dy++){for($dx=-2;$dx -le 2;$dx++){ $nx=$x+$dx;$ny=$y+$dy;if($nx -ge 0 -and $ny -ge 0 -and $nx -lt $size -and $ny -lt $size -and $body[$nx,$ny]){$keep=$true;break} }} }
    $green=[Math]::Max(0,$pixel.G-(($pixel.R+$pixel.B)/2)); $glow=[Math]::Min(145,[Math]::Max(0,($green-12)*3))
    $alpha=if($keep){255}else{[int]$glow}
    $sprite.SetPixel($x,$y,[System.Drawing.Color]::FromArgb($alpha,$pixel.R,$pixel.G,$pixel.B))
  }}
  $sprite.Save($output,[System.Drawing.Imaging.ImageFormat]::Png);$sprite.Dispose()
}
