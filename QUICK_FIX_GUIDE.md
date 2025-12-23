# Quick Fix: Port Already in Use Error

## The Problem

When you run `npm start` or `npm run dev`, you get:
```
Error: listen EADDRINUSE: address already in use :::3000
```

## What This Means

Port 3000 is already being used by another process (probably a previous instance of your server that didn't close properly).

## ✅ Solution: Kill the Process

### Method 1: One-Line PowerShell Command (Easiest)

```powershell
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force
```

Then start your server:
```bash
npm start
```

### Method 2: Step by Step

1. **Find what's using port 3000:**
   ```powershell
   netstat -ano | findstr :3000
   ```

2. **Kill the process (replace PID with the number you see):**
   ```powershell
   taskkill /PID <PID> /F
   ```

3. **Start your server:**
   ```bash
   npm start
   ```

## Alternative: Change Port

If you want to use a different port instead:

1. **Edit `.env` file:**
   ```env
   PORT=3001
   ```

2. **Start server:**
   ```bash
   npm start
   ```

## Prevention

Always stop the server properly:
- Press `Ctrl + C` in the terminal
- Wait for the server to stop
- Don't just close the terminal window

## Verify Server is Running

After starting, test it:
```bash
curl http://localhost:3000/api/health
```

Or in PowerShell:
```powershell
Invoke-WebRequest -Uri http://localhost:3000/api/health
```

## Common Causes

1. ✅ **Previous server instance still running** (most common)
2. ✅ **Another application using port 3000**
3. ✅ **Server crashed but process didn't exit**

## Quick Check Script

Create a file `kill-port.ps1`:
```powershell
$port = 3000
$process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
if ($process) {
    Stop-Process -Id $process.OwningProcess -Force
    Write-Host "✅ Killed process on port $port"
} else {
    Write-Host "✅ Port $port is free"
}
```

Run it:
```powershell
.\kill-port.ps1
```


