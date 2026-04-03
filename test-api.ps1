param([string]$baseUrl = "http://localhost:5152")

function Test-Api {
    # Register admin
    $admin = Invoke-RestMethod "$baseUrl/api/auth/register" -Method POST -ContentType "application/json" -Body '{"email":"admin2@test.com","password":"Admin123!","fullName":"Admin","role":"Admin"}'
    $headers = @{ "Authorization" = "Bearer $($admin.data.token)" }
    Write-Host "[1] Admin registered: $($admin.data.user.email)" -ForegroundColor Green

    # Register tutor
    $tutorReg = Invoke-RestMethod "$baseUrl/api/auth/register" -Method POST -ContentType "application/json" -Body '{"email":"tutor2@test.com","password":"Tutor123!","fullName":"Le Minh Tuan","role":"Tutor"}'
    $tutorToken = $tutorReg.data.token
    Write-Host "[2] Tutor registered: $($tutorReg.data.user.email)" -ForegroundColor Green

    # Login student
    $studentLogin = Invoke-RestMethod "$baseUrl/api/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"student1@test.com","password":"Student123!"}'
    $studentToken = $studentLogin.data.token
    Write-Host "[3] Student logged in: $($studentLogin.data.user.email)" -ForegroundColor Green

    # Create tutor profile
    $tHeaders = @{ "Authorization" = "Bearer $tutorToken" }
    $profile = @{ subjects=@("Toan hoc","Vat ly"); bio="Giao su dai hoc"; hourlyRate=200000; education="Thac si"; yearsOfExperience=8 } | ConvertTo-Json -Compress
    $tutorProfile = Invoke-RestMethod "$baseUrl/api/tutors/me" -Method POST -Headers $tHeaders -ContentType "application/json" -Body $profile
    $tutorId = $tutorProfile.data.id
    Write-Host "[4] Tutor profile created! ID: $tutorId" -ForegroundColor Green

    # Search tutors
    $search = Invoke-RestMethod "$baseUrl/api/tutors/search?page=1&pageSize=10" -Method GET
    Write-Host "[5] Search found $($search.data.totalCount) tutor(s)" -ForegroundColor Green

    # Create booking as student
    $sHeaders = @{ "Authorization" = "Bearer $studentToken" }
    $tomorrow = (Get-Date).AddDays(1).ToUniversalTime().ToString("o")
    $booking = @{
        tutorId = $tutorId
        subject = "Toan hoc"
        startTime = $tomorrow
        endTime = (Get-Date).AddDays(1).AddHours(2).ToUniversalTime().ToString("o")
        notes = "Can hoc Toan 12"
    } | ConvertTo-Json -Compress
    $bookingResult = Invoke-RestMethod "$baseUrl/api/bookings" -Method POST -Headers $sHeaders -ContentType "application/json" -Body $booking
    $bookingId = $bookingResult.data.id
    Write-Host "[6] Booking created! ID: $bookingId | Price: $($bookingResult.data.price)" -ForegroundColor Green

    # Create payment
    $payment = @{ bookingId = $bookingId; paymentMethod = "VNPay" } | ConvertTo-Json -Compress
    $paymentResult = Invoke-RestMethod "$baseUrl/api/payments" -Method POST -Headers $sHeaders -ContentType "application/json" -Body $payment
    Write-Host "[7] Payment completed! TXN: $($paymentResult.data.transactionId)" -ForegroundColor Green

    # Confirm booking as tutor
    $confirm = @{ status = "Confirmed" } | ConvertTo-Json -Compress
    $confirmed = Invoke-RestMethod "$baseUrl/api/bookings/$bookingId/status" -Method PATCH -Headers $tHeaders -ContentType "application/json" -Body $confirm
    Write-Host "[8] Booking confirmed! Meeting: $($confirmed.data.meetingLink)" -ForegroundColor Green

    # Complete booking as tutor
    $complete = @{ status = "Completed" } | ConvertTo-Json -Compress
    Invoke-RestMethod "$baseUrl/api/bookings/$bookingId/status" -Method PATCH -Headers $tHeaders -ContentType "application/json" -Body $complete | Out-Null
    Write-Host "[9] Booking completed!" -ForegroundColor Green

    # Leave review
    $review = @{ bookingId = $bookingId; rating = 5; comment = "Giao vien day rat hay!" } | ConvertTo-Json -Compress
    $reviewResult = Invoke-RestMethod "$baseUrl/api/reviews" -Method POST -Headers $sHeaders -ContentType "application/json" -Body $review
    Write-Host "[10] Review submitted! Rating: $($reviewResult.data.rating)/5" -ForegroundColor Green

    # Send message
    $msg = @{ receiverId = $tutorReg.data.user.id; content = "Xin chao, toi muon hoc toan!" } | ConvertTo-Json -Compress
    $msgResult = Invoke-RestMethod "$baseUrl/api/messages" -Method POST -Headers $sHeaders -ContentType "application/json" -Body $msg
    Write-Host "[11] Message sent to tutor!" -ForegroundColor Green

    # Check notifications
    $notifs = Invoke-RestMethod "$baseUrl/api/notifications" -Headers $tHeaders
    Write-Host "[12] Tutor has $($notifs.data.Count) notification(s)" -ForegroundColor Green

    Write-Host ""
    Write-Host "=== ALL API TESTS PASSED ===" -ForegroundColor Cyan
}

Test-Api
