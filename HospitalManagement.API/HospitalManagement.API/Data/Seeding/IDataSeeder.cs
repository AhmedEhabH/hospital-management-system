namespace HospitalManagement.API.Data.Seeding
{
    public interface IDataSeeder
    {
        Task SeedAsync(HospitalDbContext context);
    }
}
