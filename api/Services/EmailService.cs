using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using TutorApp.Api.Services.Interfaces;

namespace TutorApp.Api.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task SendEmailAsync(string to, string subject, string htmlBody)
    {
        var emailSettings = _configuration.GetSection("Email");
        var smtpHost = emailSettings["SmtpHost"] ?? "localhost";
        var smtpPort = int.Parse(emailSettings["SmtpPort"] ?? "587");
        var useSsl = bool.Parse(emailSettings["UseSsl"] ?? "true");
        var smtpUsername = emailSettings["SmtpUsername"] ?? "";
        var smtpPassword = emailSettings["SmtpPassword"] ?? "";
        var fromEmail = emailSettings["FromEmail"] ?? "noreply@tutorapp.com";
        var fromName = emailSettings["FromName"] ?? "GiaSu Plus";

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(fromName, fromEmail));
        message.To.Add(MailboxAddress.Parse(to));
        message.Subject = subject;

        var builder = new BodyBuilder
        {
            HtmlBody = htmlBody
        };
        message.Body = builder.ToMessageBody();

        try
        {
            using var client = new SmtpClient();
            await client.ConnectAsync(smtpHost, smtpPort, useSsl ? SecureSocketOptions.StartTls : SecureSocketOptions.None);
            
            if (!string.IsNullOrEmpty(smtpUsername) && !string.IsNullOrEmpty(smtpPassword))
            {
                await client.AuthenticateAsync(smtpUsername, smtpPassword);
            }
            
            await client.SendAsync(message);
            await client.DisconnectAsync(true);
            
            _logger.LogInformation("Email sent successfully to {To}", to);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {To}: {Message}", to, ex.Message);
            throw;
        }
    }

    public async Task SendEmailVerificationAsync(string to, string fullName, string token)
    {
        var baseUrl = _configuration["App:BaseUrl"] ?? "http://localhost:3000";
        var verificationUrl = $"{baseUrl}/auth/verify-email?token={token}";

        var subject = "Xác minh địa chỉ email của bạn - GiaSu Plus";
        
        var htmlBody = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
        .content {{ background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }}
        .button {{ display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }}
        .button:hover {{ background: #1d4ed8; }}
        .footer {{ text-align: center; padding: 20px; color: #666; font-size: 12px; }}
        .warning {{ background: #fef3c7; border-left: 4px solid #f59e0b; padding: 10px 15px; margin: 15px 0; font-size: 14px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1 style='margin:0;'>GiaSu Plus</h1>
        </div>
        <div class='content'>
            <h2>Xin chào, {fullName}!</h2>
            <p>Cảm ơn bạn đã đăng ký tài khoản tại <strong>GiaSu Plus</strong>.</p>
            <p>Để hoàn tất đăng ký và kích hoạt tài khoản, vui lòng xác minh địa chỉ email của bạn bằng cách nhấp vào nút bên dưới:</p>
            
            <div style='text-align: center;'>
                <a href='{verificationUrl}' class='button'>Xác minh email</a>
            </div>
            
            <p>Hoặc sao chép và dán liên kết sau vào trình duyệt của bạn:</p>
            <p style='word-break: break-all; font-size: 13px; color: #666;'>{verificationUrl}</p>
            
            <div class='warning'>
                <strong>Lưu ý:</strong> Liên kết xác minh sẽ hết hạn sau <strong>24 giờ</strong>. Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.
            </div>
            
            <p>Trân trọng,<br><strong>Đội ngũ GiaSu Plus</strong></p>
        </div>
        <div class='footer'>
            <p>Đây là email tự động, vui lòng không trả lời email này.</p>
            <p>&copy; {DateTime.UtcNow.Year} GiaSu Plus. Tất cả các quyền được bảo lưu.</p>
        </div>
    </div>
</body>
</html>";

        await SendEmailAsync(to, subject, htmlBody);
    }
}
