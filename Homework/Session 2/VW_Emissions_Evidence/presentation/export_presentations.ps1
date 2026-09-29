param([string]$OutputDirectory = $PSScriptRoot)
$ErrorActionPreference = 'Stop'
$vwApp = New-Object -ComObject PowerPoint.Application
$vwOpened = @()
try {
    foreach ($vwName in @('team_section_3_to_4_minutes','standalone_15_minutes')) {
        $vwPath = Join-Path $OutputDirectory ($vwName + '.pptx')
        $vwDeck = $vwApp.Presentations.Open($vwPath, $true, $false, $false)
        $vwOpened += $vwDeck
        $vwPdf = Join-Path $OutputDirectory ($vwName + '.pdf')
        $vwDeck.SaveAs($vwPdf, 32)
        $vwImages = Join-Path $OutputDirectory ('slide_previews\' + $vwName)
        New-Item -ItemType Directory -Force -Path $vwImages | Out-Null
        for ($vwIndex=1; $vwIndex -le $vwDeck.Slides.Count; $vwIndex++) {
            $vwDeck.Slides.Item($vwIndex).Export((Join-Path $vwImages ('slide-{0:00}.png' -f $vwIndex)), 'PNG', 1920, 1080)
        }
        Write-Output ($vwName + ': opened in PowerPoint; ' + $vwDeck.Slides.Count + ' slides; PDF and PNGs exported')
        $vwDeck.Close()
    }
} finally {
    $vwApp.Quit()
}
