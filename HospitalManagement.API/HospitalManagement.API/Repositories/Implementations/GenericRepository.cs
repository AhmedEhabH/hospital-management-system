using HospitalManagement.API.Data;
using HospitalManagement.API.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using Serilog;
using System.Linq.Expressions;

namespace HospitalManagement.API.Repositories.Implementations
{
    public class GenericRepository<T> : IGenericRepository<T> where T : class
    {

        protected readonly HospitalDbContext _context;
        protected readonly Serilog.ILogger _logger;
        public GenericRepository(HospitalDbContext context)
        {
            _context = context;
            _logger = Log.ForContext<T>();
        }

        public async Task<IEnumerable<T>> GetAllAsync()
        {
            _logger.Information("Fetching all records of type {EntityType}", typeof(T).Name);
            return await _context.Set<T>().ToListAsync();
        }

        public async Task<T?> GetByIdAsync(int id)
        {
            _logger.Information("Fetching {EntityType} with ID {Id}", typeof(T).Name, id);
            return await _context.Set<T>().FindAsync(id);
        }

        public async Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate)
        {
            _logger.Information("Finding {EntityType} with predicate", typeof(T).Name);
            return await _context.Set<T>().Where(predicate).ToListAsync();
        }

        public async Task AddAsync(T entity)
        {
            _logger.Information("Adding new {EntityType}", typeof(T).Name);
            await _context.Set<T>().AddAsync(entity);
        }

        public void Update(T entity)
        {
            _logger.Information("Updating {EntityType}", typeof(T).Name);
            _context.Set<T>().Update(entity);
        }

        public void Remove(T entity)
        {
            _logger.Information("Removing {EntityType}", typeof(T).Name);
            _context.Set<T>().Remove(entity);
        }

        public async Task<int> SaveChangesAsync()
        {
            _logger.Information("Saving changes to database for {EntityType}", typeof(T).Name);
            return await _context.SaveChangesAsync();
        }
    }
}
