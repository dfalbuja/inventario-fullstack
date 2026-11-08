using Microsoft.EntityFrameworkCore;
using TransactionService.Models;

namespace TransactionService.Data;

public sealed class TransactionDbContext(DbContextOptions<TransactionDbContext> options) : DbContext(options)
{
    public DbSet<Transaction> Transactions => Set<Transaction>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        var transaction = modelBuilder.Entity<Transaction>();
        transaction.Property(t => t.Type).HasConversion<string>();
        transaction.Property(t => t.UnitPrice).HasPrecision(18, 2);
        transaction.Property(t => t.TotalPrice).HasPrecision(18, 2);
    }
}
