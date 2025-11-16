# Script to update .env file with Supabase credentials
# Usage: Run this script and follow the prompts, or set the variables below

param(
    [string]$SupabaseURL = "",
    [string]$SupabaseKey = "",
    [string]$SupabaseServiceRole = ""
)

$envFile = ".env"

Write-Host "=========================================="
Write-Host "Update .env file with Supabase credentials"
Write-Host "=========================================="
Write-Host ""

# If parameters not provided, prompt for them
if (-not $SupabaseURL) {
    $SupabaseURL = Read-Host "Enter your Supabase Project URL (e.g., https://xxxxx.supabase.co)"
}

if (-not $SupabaseKey) {
    $SupabaseKey = Read-Host "Enter your Supabase Anon/Public Key"
}

if (-not $SupabaseServiceRole) {
    $SupabaseServiceRole = Read-Host "Enter your Supabase Service Role Key (optional, press Enter to skip)"
}

# Read current .env file
$envContent = @()
if (Test-Path $envFile) {
    $envContent = Get-Content $envFile
}

# Remove old Supabase entries
$envContent = $envContent | Where-Object { 
    $_ -notmatch "^SUPABASE_URL=" -and 
    $_ -notmatch "^SUPABASE_KEY=" -and 
    $_ -notmatch "^SUPABASE_SERVICE_ROLE=" 
}

# Add new Supabase entries
$envContent += "SUPABASE_URL=`"$SupabaseURL`""
$envContent += "SUPABASE_KEY=`"$SupabaseKey`""
if ($SupabaseServiceRole) {
    $envContent += "SUPABASE_SERVICE_ROLE=`"$SupabaseServiceRole`""
}

# Write back to file
$envContent | Set-Content $envFile

Write-Host ""
Write-Host "[OK] .env file updated successfully!"
Write-Host ""
Write-Host "Updated Supabase credentials:"
Write-Host "  SUPABASE_URL=$SupabaseURL"
Write-Host "  SUPABASE_KEY=$($SupabaseKey.Substring(0, [Math]::Min(20, $SupabaseKey.Length)))..."
if ($SupabaseServiceRole) {
    Write-Host "  SUPABASE_SERVICE_ROLE=$($SupabaseServiceRole.Substring(0, [Math]::Min(20, $SupabaseServiceRole.Length)))..."
}
Write-Host ""

