param([string]$OutputDirectory = $PSScriptRoot)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Speech

$scriptPath = Join-Path $OutputDirectory 'team_section_speaker_notes.md'
$scriptText = Get-Content -LiteralPath $scriptPath -Raw

function Get-NotesSection([string]$Start, [string]$End) {
    $escapedStart = [regex]::Escape($Start)
    $escapedEnd = [regex]::Escape($End)
    $match = [regex]::Match($scriptText, "$escapedStart\s*(?<body>[\s\S]*?)\s*$escapedEnd")
    if (-not $match.Success) { throw "Could not find section: $Start" }
    return $match.Groups['body'].Value
}

function Clean-Narration([string]$Text) {
    $Text = $Text -replace '(?m)^\*.*?\*\s*$', ''
    $Text = $Text -replace '(?m)^Source:.*$', ''
    $Text = $Text -replace '(?m)^## .*$', ''
    $Text = $Text -replace '(?m)^# .*$', ''
    $Text = $Text -replace '[*_]', ''
    return (($Text -replace '\s+', ' ').Trim())
}

$slide1 = Get-NotesSection '## Slide 1' '## Slide 2'
$slide2 = Get-NotesSection '## Slide 2' '## Slide 3'
$slide3 = Get-NotesSection '## Slide 3' '## Slide 4'

$segments = @(
    @{ Name = 'slide-01'; Text = (Clean-Narration $slide1) },
    @{ Name = 'slide-02'; Text = (Clean-Narration $slide2) },
    @{ Name = 'slide-03'; Text = (Clean-Narration $slide3) }
)

$audioDir = Join-Path $OutputDirectory 'voiceover_team'
New-Item -ItemType Directory -Force -Path $audioDir | Out-Null
$voice = New-Object System.Speech.Synthesis.SpeechSynthesizer
$voice.Rate = 1
foreach ($segment in $segments) {
    $wav = Join-Path $audioDir ($segment.Name + '.wav')
    $voice.SetOutputToWaveFile($wav)
    $voice.Speak($segment.Text)
    $voice.SetOutputToNull()
    Write-Output ($segment.Name + ': ' + $segment.Text.Length + ' characters')
}
$voice.Dispose()
