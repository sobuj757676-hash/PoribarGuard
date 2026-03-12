$uri = "http://localhost:3000/api/admin/apk/upload"
$file1 = "public/uploads/apk/dummy_wizard.apk"
$file2 = "public/uploads/apk/dummy_child.apk"

# Ensure we have our dummy files
if (!(Test-Path $file1)) { Set-Content -Path $file1 -Value "dummy wizard content" }
if (!(Test-Path $file2)) { Set-Content -Path $file2 -Value "dummy child content" }

# This is a bit too complex to do clean multipart in old PS versions,
# Let's bypass form-data and test the DB manually using a Prisma script.
