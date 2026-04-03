param([string]$baseUrl = "http://localhost:5152")

$stamp = [DateTime]::Now.Ticks
function Test-ApiFull {
    Write-Host "=== GiaSu Plus API Integration Test ===" -ForegroundColor Cyan

    # 1. Register admin
    $admin = Invoke-RestMethod "$baseUrl/api/auth/register" -Method POST -ContentType "application/json" -Body (@{ email="admin_$stamp@test.com"; password="Admin123!"; fullName="Admin"; role="Admin" } | ConvertTo-Json)
    if (-not $admin.success) { Write-Host "[1] FAIL: $($admin.message)" -ForegroundColor Red; return }
    $adminToken = $admin.data.token
    Write-Host "[1] PASS - Admin registered: $($admin.data.user.email)" -ForegroundColor Green

    # 2. Register tutor
    $tutorReg = Invoke-RestMethod "$baseUrl/api/auth/register" -Method POST -ContentType "application/json" -Body (@{ email="tutor_$stamp@test.com"; password="Tutor123!"; fullName="Le Tuan"; role="Tutor" } | ConvertTo-Json)
    if (-not $tutorReg.success) { Write-Host "[2] FAIL: $($tutorReg.message)" -ForegroundColor Red; return }
    $tutorToken = $tutorReg.data.token
    $tutorId = $tutorReg.data.user.id
    Write-Host "[2] PASS - Tutor registered: $($tutorReg.data.user.email)" -ForegroundColor Green

    # 3. Register student
    $studentReg = Invoke-RestMethod "$baseUrl/api/auth/register" -Method POST -ContentType "application/json" -Body (@{ email="student_$stamp@test.com"; password="Student123!"; fullName="Nguyen Hung"; role="Student" } | ConvertTo-Json)
    if (-not $studentReg.success) { Write-Host "[3] FAIL: $($studentReg.message)" -ForegroundColor Red; return }
    $studentToken = $studentReg.data.token
    $studentId = $studentReg.data.user.id
    Write-Host "[3] PASS - Student registered: $($studentReg.data.user.email)" -ForegroundColor Green

    # 4. Create tutor profile
    $tHeaders = @{ "Authorization" = "Bearer $tutorToken" }
    $profile = (@{ subjects=@("Toan","Ly"); bio="Thac si DHQG"; hourlyRate=200000; education="Thac si"; yearsOfExperience=8 } | ConvertTo-Json -Compress)
    $tutorProfile = Invoke-RestMethod "$baseUrl/api/tutors/me" -Method POST -Headers $tHeaders -ContentType "application/json" -Body $profile
    if (-not $tutorProfile.success) { Write-Host "[4] FAIL: $($tutorProfile.message)" -ForegroundColor Red; return }
    $tutorId = $tutorProfile.data.id
    Write-Host "[4] PASS - Tutor profile created! ID: $tutorId" -ForegroundColor Green

    # 5. Search tutors
    $search = Invoke-RestMethod "$baseUrl/api/tutors/search?page=1&pageSize=10" -Method GET
    if (-not $search.success) { Write-Host "[5] FAIL" -ForegroundColor Red; return }
    Write-Host "[5] PASS - Search found $($search.data.totalCount) tutor(s)" -ForegroundColor Green

    # 6. Create booking
    $sHeaders = @{ "Authorization" = "Bearer $studentToken" }
    $tomorrow = (Get-Date).AddDays(1).ToUniversalTime().ToString("o")
    $endTime = (Get-Date).AddDays(1).AddHours(2).ToUniversalTime().ToString("o")
    $booking = (@{ tutorId=$tutorId; subject="Toan"; startTime=$tomorrow; endTime=$endTime; notes="Can hoc Toan" } | ConvertTo-Json -Compress)
    $bookingResult = Invoke-RestMethod "$baseUrl/api/bookings" -Method POST -Headers $sHeaders -ContentType "application/json" -Body $booking
    if (-not $bookingResult.success) { Write-Host "[6] FAIL: $($bookingResult.message)" -ForegroundColor Red; return }
    $bookingId = $bookingResult.data.id
    Write-Host "[6] PASS - Booking created! ID: $bookingId | Price: $($bookingResult.data.price)" -ForegroundColor Green

    # 7. Create payment
    $payment = (@{ bookingId=$bookingId; paymentMethod="VNPay" } | ConvertTo-Json -Compress)
    $paymentResult = Invoke-RestMethod "$baseUrl/api/payments" -Method POST -Headers $sHeaders -ContentType "application/json" -Body $payment
    if (-not $paymentResult.success) { Write-Host "[7] FAIL: $($paymentResult.message)" -ForegroundColor Red; return }
    Write-Host "[7] PASS - Payment completed! TXN: $($paymentResult.data.transactionId)" -ForegroundColor Green

    # 8. Confirm booking (as tutor)
    $confirm = (@{ status="Confirmed" } | ConvertTo-Json -Compress)
    $confirmed = Invoke-RestMethod "$baseUrl/api/bookings/$bookingId/status" -Method PATCH -Headers $tHeaders -ContentType "application/json" -Body $confirm
    if (-not $confirmed.success) { Write-Host "[8] FAIL: $($confirmed.message)" -ForegroundColor Red; return }
    Write-Host "[8] PASS - Booking confirmed! Meeting: $($confirmed.data.meetingLink)" -ForegroundColor Green

    # 9. Complete booking
    $complete = (@{ status="Completed" } | ConvertTo-Json -Compress)
    $completed = Invoke-RestMethod "$baseUrl/api/bookings/$bookingId/status" -Method PATCH -Headers $tHeaders -ContentType "application/json" -Body $complete
    if (-not $completed.success) { Write-Host "[9] FAIL: $($completed.message)" -ForegroundColor Red; return }
    Write-Host "[9] PASS - Booking completed!" -ForegroundColor Green

    # 10. Leave review
    $review = (@{ bookingId=$bookingId; rating=5; comment="Giao vien rat hay!" } | ConvertTo-Json -Compress)
    $reviewResult = Invoke-RestMethod "$baseUrl/api/reviews" -Method POST -Headers $sHeaders -ContentType "application/json" -Body $review
    if (-not $reviewResult.success) { Write-Host "[10] FAIL: $($reviewResult.message)" -ForegroundColor Red; return }
    Write-Host "[10] PASS - Review submitted! Rating: $($reviewResult.data.rating)/5" -ForegroundColor Green

    # 11. Send message (receiverId = tutor's user ID, not tutor profile ID)
    $msg = (@{ receiverId=$tutorReg.data.user.id; content="Xin chao, muon hoc toan!" } | ConvertTo-Json -Compress)
    $msgResult = Invoke-RestMethod "$baseUrl/api/messages" -Method POST -Headers $sHeaders -ContentType "application/json" -Body $msg
    if (-not $msgResult.success) { Write-Host "[11] FAIL: $($msgResult.message)" -ForegroundColor Red; return }
    Write-Host "[11] PASS - Message sent!" -ForegroundColor Green

    # 12. Get conversations
    $convs = Invoke-RestMethod "$baseUrl/api/messages/conversations" -Headers $sHeaders
    if (-not $convs.success) { Write-Host "[12] FAIL" -ForegroundColor Red; return }
    Write-Host "[12] PASS - Got $($convs.data.Count) conversation(s)" -ForegroundColor Green

    # 13. Get notifications (tutor)
    $notifs = Invoke-RestMethod "$baseUrl/api/notifications" -Headers $tHeaders
    if (-not $notifs.success) { Write-Host "[13] FAIL" -ForegroundColor Red; return }
    Write-Host "[13] PASS - Tutor has $($notifs.data.Count) notification(s)" -ForegroundColor Green

    Write-Host ""
    Write-Host "=== ALL 13 TESTS PASSED ===" -ForegroundColor Cyan
}

Test-ApiFull
