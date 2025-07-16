using Microsoft.EntityFrameworkCore;

public class CareConnectContext : DbContext
{
    public CareConnectContext(DbContextOptions<CareConnectContext> options)
        : base(options) { }

    public DbSet<PatientDto> PatientsDto { get; set; }  // For stored procedure result

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<PatientDto>().HasNoKey();
    }
}