# Quick script to set Supabase keys in .env file
# Usage: Just run this script and enter your keys when prompted

$envFile = ".env"

Write-Host ""
Write-Host "=========================================="
Write-Host "Set Supabase Credentials in .env"
Write-Host "=========================================="
Write-Host ""

# Read current file
$content = Get-Content $envFile -Raw

# Get Supabase credentials from user
Write-Host "Enter your Supabase credentials:"
Write-Host "(You can find these in your Supabase project: Settings > API)"
Write-Host ""
$supabaseURL = Read-Host "Supabase Project URL (e.g., https://xxxxx.supabase.co)"
$supabaseKey = Read-Host "Supabase Anon/Public Key"
$supabaseServiceRole = Read-Host "Supabase Service Role Key (optional, press Enter to keep existing)"

# Replace the placeholder values
$content = $content -replace 'SUPABASE_URL="https://your-project\.supabase\.co"', "SUPABASE_URL=`"$supabaseURL`""
$content = $content -replace 'SUPABASE_KEY="your-anon-key"', "SUPABASE_KEY=`"$supabaseKey`""

if ($supabaseServiceRole -and $supabaseServiceRole -ne "") {
    $content = $content -replace 'SUPABASE_SERVICE_ROLE="your-service-role-key"', "SUPABASE_SERVICE_ROLE=`"$supabaseServiceRole`""
}

# Write back to file
$content | Set-Content $envFile

Write-Host ""
Write-Host "[OK] .env file updated with Supabase credentials!"
Write-Host ""
Write-Host "Verification:"
Get-Content $envFile | Select-String "SUPABASE"
Write-Host ""

