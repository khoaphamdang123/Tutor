using BCrypt.Net;
using Npgsql;
using Microsoft.EntityFrameworkCore;
using TutorApp.Api.Data;
using TutorApp.Api.Models;

var newPassword = args.Length > 0 ? args[0] : throw new Exception("Password argument required.");
var email = args.Length > 1 ? args[1] : "admin@giasuplus.com";

// Load connection string from appsettings.json
var connString = "Host=localhost;Database=tutor;Username=postgres;Password=postgres";
var builder = WebApplication.CreateBuilder(args);
var config = builder.Configuration.GetConnectionString("DefaultConnection");
if (!string.IsNullOrEmpty(config)) connString = config;

// Update directly via ADO.NET — BCrypt hash
var hash = BCrypt.Net.BCrypt.HashPassword(newPassword, workFactor: 12);

await using var conn = new NpgsqlConnection(connString);
await conn.OpenAsync();

var rows = await NpgsqlCommand.ExecuteNonQueryAsync(conn,
    "UPDATE users SET password_hash = @hash, updated_at = @now WHERE email = @email",
    new NpgsqlParameter("@hash", hash),
    new NpgsqlParameter("@now", DateTime.UtcNow),
    new NpgsqlParameter("@email", email.ToLower()));

if (rows == 0)
    Console.WriteLine($"No user found with email '{email}'.");
else
    Console.WriteLine($"Password updated for '{email}'. New hash: {hash}");
