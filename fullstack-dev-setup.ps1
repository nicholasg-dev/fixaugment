# Fullstack Developer Environment Setup Script for Windows
# Run this script as Administrator in PowerShell

# Function to check if Chocolatey is installed
function Install-Chocolatey {
    if (!(Get-Command choco -ErrorAction SilentlyContinue)) {
        Write-Host "Installing Chocolatey..."
        Set-ExecutionPolicy Bypass -Scope Process -Force
        [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
        Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
    } else {
        Write-Host "Chocolatey is already installed."
    }
}

# Install Chocolatey if needed
Install-Chocolatey

# Refresh environment variables
refreshenv | Out-Null

# List of packages to install via Chocolatey
$packages = @(
    'git',
    'nodejs-lts',
    'yarn',
    'python',
    'python2', # For legacy support
    'vscode',
    'docker-desktop',
    'openjdk',
    'dotnet-sdk',
    'postgresql',
    'mysql',
    'mongodb',
    'redis-64',
    'googlechrome'
)

# Install each package
foreach ($pkg in $packages) {
    Write-Host "Installing $pkg ..."
    choco install $pkg -y --ignore-checksums
}

# Install WSL and Ubuntu
Write-Host "\nSetting up WSL and Ubuntu..."
if (!(wsl -l -q | Select-String -Pattern "Ubuntu")) {
    wsl --install -d Ubuntu
    Write-Host "WSL and Ubuntu installation initiated. You may need to restart your computer."
} else {
    Write-Host "WSL and Ubuntu are already installed."
}

Write-Host "\nAll requested packages have been installed. Please restart your computer if prompted, especially after WSL or Docker Desktop installation."
