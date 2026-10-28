$loginBody = '{ "email": "admin@arsalan-portfolio.com", "password": "admin123" }'
$loginRes = Invoke-RestMethod -Uri 'http://localhost:5000/api/v1/auth/login' -Method POST -ContentType 'application/json' -Body $loginBody
$token = $loginRes.data.accessToken
$h = @{ Authorization = "Bearer $token" }
$baseUrl = 'http://localhost:5000/api/v1/admin'
$pass = 0
$fail = 0
$errors = @()

function Test-Endpoint {
    param($name, $method, $url, $body, $expectSuccess)
    try {
        $params = @{ Uri = $url; Headers = $h; Method = $method; ContentType = 'application/json' }
        if ($body) { $params.Body = $body }
        $res = Invoke-RestMethod @params
        if ($expectSuccess -and $res.success) {
            Write-Host "  PASS: $name" -ForegroundColor Green
            $script:pass++
            return $res
        } elseif (!$expectSuccess -and !$res.success) {
            Write-Host "  PASS: $name (expected error)" -ForegroundColor Green
            $script:pass++
            return $res
        } else {
            Write-Host "  FAIL: $name - $($res.message)" -ForegroundColor Red
            $script:fail++
            $script:errors += "$name : $($res.message)"
            return $res
        }
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if (!$expectSuccess -and $statusCode -ge 400) {
            Write-Host "  PASS: $name (expected error $statusCode)" -ForegroundColor Green
            $script:pass++
            return $null
        }
        Write-Host "  FAIL: $name - HTTP $statusCode : $($_.Exception.Message)" -ForegroundColor Red
        $script:fail++
        $script:errors += "$name : HTTP $statusCode"
        return $null
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  FULL CRUD TEST SUITE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# --- CATEGORIES ---
Write-Host ""
Write-Host "--- CATEGORIES ---" -ForegroundColor Yellow
Test-Endpoint "GET All" "GET" "$baseUrl/categories?page=1&limit=5" $null $true
$cr = Test-Endpoint "CREATE" "POST" "$baseUrl/categories" '{ "category_title": "DevOps Pipeline", "icon": "rocket" }' $true
$id = $cr.data._id
Test-Endpoint "GET By ID" "GET" "$baseUrl/categories/$id" $null $true
Test-Endpoint "UPDATE" "PUT" "$baseUrl/categories/$id" '{ "category_title": "DevOps Pipeline Tools", "icon": "gear" }' $true
Test-Endpoint "DELETE" "DELETE" "$baseUrl/categories/$id" $null $true
Test-Endpoint "HARD DELETE" "DELETE" "$baseUrl/categories/hard-delete/$id" $null $true
Test-Endpoint "DELETE ALL" "POST" "$baseUrl/categories/delete-all" '{ "ids": [] }' $true

# --- TECHNOLOGIES ---
Write-Host ""
Write-Host "--- TECHNOLOGIES ---" -ForegroundColor Yellow
Test-Endpoint "GET All" "GET" "$baseUrl/technologies?page=1&limit=5" $null $true
$cr = Test-Endpoint "CREATE" "POST" "$baseUrl/technologies" '{ "technology_title": "Bun Runtime", "icon": "bun" }' $true
$id = $cr.data._id
Test-Endpoint "GET By ID" "GET" "$baseUrl/technologies/$id" $null $true
Test-Endpoint "UPDATE" "PUT" "$baseUrl/technologies/$id" '{ "technology_title": "Bun JS Runtime" }' $true
Test-Endpoint "DELETE" "DELETE" "$baseUrl/technologies/$id" $null $true
Test-Endpoint "HARD DELETE" "DELETE" "$baseUrl/technologies/hard-delete/$id" $null $true

# --- SLUGS ---
Write-Host ""
Write-Host "--- SLUGS ---" -ForegroundColor Yellow
Test-Endpoint "GET All" "GET" "$baseUrl/slugs?page=1&limit=5" $null $true
$cr = Test-Endpoint "CREATE" "POST" "$baseUrl/slugs" '{ "slug_title": "test-driven-development" }' $true
$id = $cr.data._id
Test-Endpoint "GET By ID" "GET" "$baseUrl/slugs/$id" $null $true
Test-Endpoint "UPDATE" "PUT" "$baseUrl/slugs/$id" '{ "slug_title": "tdd-methodology" }' $true
Test-Endpoint "DELETE" "DELETE" "$baseUrl/slugs/$id" $null $true
Test-Endpoint "HARD DELETE" "DELETE" "$baseUrl/slugs/hard-delete/$id" $null $true

# --- SKILLS ---
Write-Host ""
Write-Host "--- SKILLS ---" -ForegroundColor Yellow
Test-Endpoint "GET All" "GET" "$baseUrl/skills?page=1&limit=5" $null $true
$cr = Test-Endpoint "CREATE" "POST" "$baseUrl/skills" '{ "skill_title": "System Design", "skill_option": "expert" }' $true
$id = $cr.data._id
Test-Endpoint "GET By ID" "GET" "$baseUrl/skills/$id" $null $true
Test-Endpoint "UPDATE" "PUT" "$baseUrl/skills/$id" '{ "skill_title": "System Architecture", "skill_option": "intermediate" }' $true
Test-Endpoint "DELETE" "DELETE" "$baseUrl/skills/$id" $null $true
Test-Endpoint "HARD DELETE" "DELETE" "$baseUrl/skills/hard-delete/$id" $null $true

# --- PUBLIC ENDPOINTS ---
Write-Host ""
Write-Host "--- PUBLIC ENDPOINTS ---" -ForegroundColor Yellow
Test-Endpoint "GET Categories" "GET" "http://localhost:5000/api/v1/public/categories" $null $true
Test-Endpoint "GET Technologies" "GET" "http://localhost:5000/api/v1/public/technologies" $null $true
Test-Endpoint "GET Projects" "GET" "http://localhost:5000/api/v1/public/projects" $null $true
Test-Endpoint "GET Services" "GET" "http://localhost:5000/api/v1/public/services" $null $true
Test-Endpoint "GET Banners" "GET" "http://localhost:5000/api/v1/public/banners" $null $true
Test-Endpoint "GET Gallery" "GET" "http://localhost:5000/api/v1/public/gallery" $null $true
Test-Endpoint "GET Blogs" "GET" "http://localhost:5000/api/v1/public/blogs" $null $true
Test-Endpoint "GET About" "GET" "http://localhost:5000/api/v1/public/about" $null $true
Test-Endpoint "GET Resume" "GET" "http://localhost:5000/api/v1/public/resume" $null $true

# --- USER / AUTH ---
Write-Host ""
Write-Host "--- USER / AUTH ---" -ForegroundColor Yellow
Test-Endpoint "GET Profile" "GET" "http://localhost:5000/api/v1/user/profile" $null $true
Test-Endpoint "GET Wishlist" "GET" "http://localhost:5000/api/v1/user/wishlist" $null $true
Test-Endpoint "GET Cart" "GET" "http://localhost:5000/api/v1/user/cart" $null $true
Test-Endpoint "GET Countries" "GET" "http://localhost:5000/api/v1/user/countries" $null $true

# --- DASHBOARD ---
Write-Host ""
Write-Host "--- DASHBOARD ---" -ForegroundColor Yellow
Test-Endpoint "GET Metrics" "GET" "$baseUrl/dashboard/metrics" $null $true
Test-Endpoint "GET Analytics" "GET" "$baseUrl/dashboard/analytics" $null $true
Test-Endpoint "GET Recent" "GET" "$baseUrl/dashboard/recent-activities" $null $true

# --- ORDERS ---
Write-Host ""
Write-Host "--- ORDERS ---" -ForegroundColor Yellow
Test-Endpoint "GET Orders" "GET" "$baseUrl/orders" $null $true

# --- GALLERY ---
Write-Host ""
Write-Host "--- GALLERY ---" -ForegroundColor Yellow
Test-Endpoint "GET Gallery" "GET" "$baseUrl/gallery" $null $true

# --- BANNERS ---
Write-Host ""
Write-Host "--- BANNERS ---" -ForegroundColor Yellow
Test-Endpoint "GET Banners" "GET" "$baseUrl/banners" $null $true

# --- CONTACT QUERIES ---
Write-Host ""
Write-Host "--- CONTACT QUERIES ---" -ForegroundColor Yellow
Test-Endpoint "GET Queries" "GET" "$baseUrl/contact-queries" $null $true

# --- PROMO CODES ---
Write-Host ""
Write-Host "--- PROMO CODES ---" -ForegroundColor Yellow
Test-Endpoint "GET All" "GET" "$baseUrl/promo-codes" $null $true

# --- ABOUT ---
Write-Host ""
Write-Host "--- ABOUT ---" -ForegroundColor Yellow
Test-Endpoint "GET All" "GET" "$baseUrl/about" $null $true

# --- BLOGS ---
Write-Host ""
Write-Host "--- BLOGS ---" -ForegroundColor Yellow
Test-Endpoint "GET All" "GET" "$baseUrl/blogs" $null $true

# --- CHATBOT ---
Write-Host ""
Write-Host "--- CHATBOT ---" -ForegroundColor Yellow
Test-Endpoint "GET Instructions" "GET" "$baseUrl/chatbot" $null $true

# --- RESUME ---
Write-Host ""
Write-Host "--- RESUME ---" -ForegroundColor Yellow
Test-Endpoint "GET Resume" "GET" "$baseUrl/resume" $null $true

# --- ADMIN PROFILE ---
Write-Host ""
Write-Host "--- ADMIN PROFILE ---" -ForegroundColor Yellow
Test-Endpoint "GET Profile" "GET" "$baseUrl/profile" $null $true

# --- COUNTRIES ---
Write-Host ""
Write-Host "--- COUNTRIES ---" -ForegroundColor Yellow
Test-Endpoint "GET All" "GET" "$baseUrl/countries" $null $true

# --- CITIES ---
Write-Host ""
Write-Host "--- CITIES ---" -ForegroundColor Yellow
Test-Endpoint "GET All" "GET" "$baseUrl/cities" $null $true

# SUMMARY
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
if ($fail -eq 0) {
    Write-Host "  ALL TESTS PASSED: $pass/$pass" -ForegroundColor Green
} else {
    Write-Host "  RESULTS: $pass PASS | $fail FAIL" -ForegroundColor Red
    Write-Host "  ERRORS:" -ForegroundColor Red
    $errors | ForEach-Object { Write-Host "    - $_" -ForegroundColor Red }
}
Write-Host "========================================" -ForegroundColor Cyan
