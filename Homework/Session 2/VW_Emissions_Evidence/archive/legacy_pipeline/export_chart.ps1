param([Parameter(Mandatory=$true)][string]$DeckPath,[Parameter(Mandatory=$true)][string]$ImagePath)
$ErrorActionPreference='Stop'
$vwApp=New-Object -ComObject PowerPoint.Application
try {
    $vwDeck=$vwApp.Presentations.Open($DeckPath,$true,$false,$false)
    $vwDeck.Slides.Item(2).Export($ImagePath,'PNG',1920,1080)
    $vwDeck.Close()
} finally {$vwApp.Quit()}
