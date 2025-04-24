# Script to install all VSCode extensions from the recommendations list

# Get the list of extensions from the .vscode/extensions.json file
$extensionsJson = Get-Content -Path ".vscode/extensions.json" -Raw | ConvertFrom-Json
$extensions = $extensionsJson.recommendations

# Display the number of extensions to install
Write-Host "Found $($extensions.Count) extensions to install..."

# Install each extension
foreach ($extension in $extensions) {
    Write-Host "Installing extension: $extension"
    & code --install-extension $extension
}

Write-Host "All extensions have been installed!"
