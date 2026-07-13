# =====================================================
# SutraSparsh Importer Structure Generator
# Version : 1.0
# Author  : VGupta
# =====================================================

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " SutraSparsh Importer Setup"
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# ----------------------------------------------------
# Locate project root
# ----------------------------------------------------

$ProjectRoot = Get-Location

$ImporterRoot = Join-Path $ProjectRoot "backend\importer"

if (!(Test-Path $ImporterRoot)) {
    New-Item -ItemType Directory -Path $ImporterRoot | Out-Null
}

# ----------------------------------------------------
# Create src
# ----------------------------------------------------

$SrcRoot = Join-Path $ImporterRoot "src"

if (!(Test-Path $SrcRoot)) {
    New-Item -ItemType Directory -Path $SrcRoot | Out-Null
    Write-Host "[Folder] src"
}

# ----------------------------------------------------
# Source folders
# ----------------------------------------------------

$SourceFolders = @(
"api",
"audio",
"collector",
"config",
"enrichers",
"firestore",
"normalizer",
"publisher",
"scheduler",
"shared",
"translators",
"types",
"utils",
"validator"
)

foreach($folder in $SourceFolders){

    $Target = Join-Path $SrcRoot $folder

    if(!(Test-Path $Target)){

        New-Item -ItemType Directory -Path $Target | Out-Null

        Write-Host "[Folder] src\$folder"

    }

}

# ----------------------------------------------------
# Move existing folders into src
# ----------------------------------------------------

foreach($folder in $SourceFolders){

    $Old = Join-Path $ImporterRoot $folder

    $New = Join-Path $SrcRoot $folder

    if((Test-Path $Old) -and !(Test-Path "$New\.moved")){

        $Files = Get-ChildItem $Old -Force

        if($Files.Count -eq 0){

            Remove-Item $Old

            Write-Host "[Removed Empty Folder] $folder"

        }
        else{

            Move-Item "$Old\*" $New -Force

            Remove-Item $Old

            Write-Host "[Moved] $folder -> src\$folder"

        }

    }

}

# ----------------------------------------------------
# Additional folders
# ----------------------------------------------------

$ExtraFolders=@(

"logs",

"tests"

)

foreach($folder in $ExtraFolders){

    $Path=Join-Path $ImporterRoot $folder

    if(!(Test-Path $Path)){

        New-Item -ItemType Directory -Path $Path | Out-Null

        Write-Host "[Folder] $folder"

    }

}

# ----------------------------------------------------
# Files
# ----------------------------------------------------

$Files=@(

".env.example",

".gitignore",

"README.md",

"package.json",

"tsconfig.json"

)

foreach($file in $Files){

    $Path=Join-Path $ImporterRoot $file

    if(!(Test-Path $Path)){

        New-Item -ItemType File -Path $Path | Out-Null

        Write-Host "[File] $file"

    }

}

# ----------------------------------------------------
# index.ts
# ----------------------------------------------------

$Index = Join-Path $SrcRoot "index.ts"

if(!(Test-Path $Index)){

@'

console.log("================================");
console.log(" SutraSparsh Import Engine");
console.log(" Version 1.0");
console.log("================================");

'@ | Set-Content $Index

Write-Host "[File] src\index.ts"

}

# ----------------------------------------------------
# README
# ----------------------------------------------------

$Readme = Join-Path $ImporterRoot "README.md"

if((Get-Item $Readme).Length -eq 0){

@'
# SutraSparsh Import Engine

Responsible for:

- Importing content
- Normalizing content
- Validating content
- Publishing to Firestore
- Creating Daily Pool

Technology

- Node.js
- TypeScript
- Firebase Admin
- Axios
- Zod
- Winston

'@ | Set-Content $Readme

}

# ----------------------------------------------------
# .gitignore
# ----------------------------------------------------

$GitIgnore = Join-Path $ImporterRoot ".gitignore"

if((Get-Item $GitIgnore).Length -eq 0){

@'
node_modules
dist
.env
logs
coverage

'@ | Set-Content $GitIgnore

}

# ----------------------------------------------------
# .env.example
# ----------------------------------------------------

$Env = Join-Path $ImporterRoot ".env.example"

if((Get-Item $Env).Length -eq 0){

@'
FIREBASE_SERVICE_ACCOUNT_PATH=

GOOGLE_TRANSLATE_API_KEY=

BHASHINI_API_KEY=

'@ | Set-Content $Env

}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host " Importer Structure Ready"
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""