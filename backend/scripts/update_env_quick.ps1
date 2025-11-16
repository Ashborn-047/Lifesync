# Quick script to add Supabase credentials to .env
# Usage: .\scripts\update_env_quick.ps1

$envFile = ".env"

Write-Host "Current .env file contents:"
Write-Host "---------------------------"
Get-Content $envFile
Write-Host ""
Write-Host "To add Supabase credentials, run:"
Write-Host "  .\scripts\update_env_supabase.ps1"
Write-Host ""
Write-Host "Or manually edit .env and add:"
Write-Host "  SUPABASE_URL=`"https://your-project.supabase.co`""
Write-Host "  SUPABASE_KEY=`"your-anon-key`""
Write-Host "  SUPABASE_SERVICE_ROLE=`"your-service-role-key`""
Write-Host ""

