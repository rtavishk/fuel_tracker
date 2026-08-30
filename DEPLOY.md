# Deploy Scripts

This directory contains automated deployment scripts for FuelTracker.

## Usage

### Windows (PowerShell)
```powershell
.\deploy.ps1 <version> <message>
```

**Example:**
```powershell
.\deploy.ps1 "1.7" "Fix mobile issues and add new features"
```

### Linux/Mac (Bash)
```bash
./deploy.sh <version> <message>
```

**Example:**
```bash
./deploy.sh "1.7" "Fix mobile issues and add new features"
```

## What the script does

1. **Updates version** in `src/lib/version.ts` to the specified version
2. **Calculates next version** automatically (current + 0.1)
3. **Runs build** (`pnpm run build`)
4. **Stages all changes** (`git add .`)
5. **Commits** with formatted message: `Version X.XX : <message>`
6. **Pushes** to remote repository

## Requirements

- pnpm must be installed
- Git must be configured with proper credentials
- No build errors should exist

## Error Handling

The script will stop and exit with an error if:
- Build fails
- Git operations fail
- Version file is missing

## Notes

- The script automatically increments the NEXT_VERSION by 0.1
- Always run from the project root directory
- Make sure to commit any uncommitted changes before running
