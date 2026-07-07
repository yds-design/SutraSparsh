# ============================================
# SutraSparsh Project Structure Generator
# Version : 1.0
# ============================================

$Root = Get-Location

Write-Host ""
Write-Host "Creating SutraSparsh project structure..." -ForegroundColor Cyan
Write-Host ""

# -----------------------------
# Folder List
# -----------------------------

$folders = @(

".github\workflows"

"assets"
"assets\audio"
"assets\fonts"
"assets\icons"
"assets\illustrations"
"assets\images"
"assets\logos"
"assets\lottie"
"assets\placeholders"
"assets\splash"

"backend"
"backend\config"
"backend\firestore"
"backend\importer"
"backend\importer\api"
"backend\importer\collector"
"backend\importer\normalizer"
"backend\importer\validator"
"backend\importer\enrichers"
"backend\importer\translators"
"backend\importer\audio"
"backend\importer\publisher"
"backend\importer\scheduler"
"backend\importer\shared"
"backend\logs"
"backend\tests"

"docs"
"docs\api"
"docs\architecture"
"docs\content"
"docs\decisions"
"docs\firestore"
"docs\importer"
"docs\sprint"
"docs\ui"

"scripts"

"src"
"src\api"
"src\components"
"src\components\buttons"
"src\components\cards"
"src\components\common"
"src\components\forms"
"src\components\modal"
"src\components\player"
"src\components\typography"

"src\config"
"src\constants"
"src\context"
"src\firebase"
"src\hooks"
"src\navigation"

"src\screens"
"src\screens\favorites"
"src\screens\home"
"src\screens\onboarding"
"src\screens\profile"
"src\screens\search"
"src\screens\settings"
"src\screens\shloka"
"src\screens\splash"

"src\services"
"src\services\analytics"
"src\services\audio"
"src\services\content"
"src\services\notification"
"src\services\search"
"src\services\translation"

"src\store"

"src\theme"

"src\types"

"src\utils"

"src\validation"

"tests"
)

foreach ($folder in $folders) {

    if (!(Test-Path $folder)) {

        New-Item -ItemType Directory -Path $folder | Out-Null
        Write-Host "[Folder] $folder"

    }

}

# -----------------------------
# Files
# -----------------------------

$files = @(

".github\workflows\ci.yml"
".github\workflows\lint.yml"
".github\workflows\release.yml"

"backend\README.md"

"docs\README.md"

"docs\architecture\README.md"
"docs\api\README.md"
"docs\content\README.md"
"docs\firestore\README.md"
"docs\importer\README.md"
"docs\sprint\README.md"
"docs\ui\README.md"
"docs\decisions\README.md"

"src\theme\colors.ts"
"src\theme\spacing.ts"
"src\theme\typography.ts"
"src\theme\radius.ts"
"src\theme\shadows.ts"
"src\theme\animations.ts"
"src\theme\index.ts"

"src\firebase\config.ts"
"src\firebase\auth.ts"
"src\firebase\firestore.ts"
"src\firebase\storage.ts"
"src\firebase\analytics.ts"

"src\config\app.ts"
"src\config\env.ts"
"src\config\firebase.ts"

"src\constants\index.ts"

"src\navigation\index.tsx"

"src\store\auth.ts"
"src\store\content.ts"
"src\store\favorites.ts"
"src\store\settings.ts"
"src\store\theme.ts"

"src\types\Audio.ts"
"src\types\Category.ts"
"src\types\Content.ts"
"src\types\DailyPool.ts"
"src\types\Settings.ts"
"src\types\Translation.ts"
"src\types\User.ts"

"src\utils\constants.ts"
"src\utils\date.ts"
"src\utils\logger.ts"
"src\utils\slug.ts"
"src\utils\string.ts"
"src\utils\validator.ts"

"CHANGELOG.md"
"CODE_OF_CONDUCT.md"
"CONTRIBUTING.md"
"SECURITY.md"

)

foreach ($file in $files) {

    if (!(Test-Path $file)) {

        New-Item -ItemType File -Path $file | Out-Null
        Write-Host "[File] $file"

    }

}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Green
Write-Host "SutraSparsh Project Structure Complete"
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""