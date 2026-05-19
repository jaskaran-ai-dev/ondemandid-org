param($Method = "GET", $Uri = "", $Body = $null)

$headers = @{}
if ($Method -eq "POST") {
    $headers["Content-Type"] = "application/json"
}

if ($Body) {
    $Body = $Body | ConvertTo-Json -Depth 10
}

Invoke-RestMethod -Uri $Uri -Method $Method -Headers $headers -Body $Body