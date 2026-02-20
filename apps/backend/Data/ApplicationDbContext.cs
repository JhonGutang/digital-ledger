using Microsoft.EntityFrameworkCore;

namespace DigitalLedger.Api.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        // DbSets will be added here as models are created
    }
}
