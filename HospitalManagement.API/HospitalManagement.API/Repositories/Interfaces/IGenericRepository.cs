using System.Linq.Expressions;

namespace HospitalManagement.API.Repositories.Interfaces
{
    public interface IGenericRepository<T> where T : class
    {
        // Synchronous methods
        Task<T?> GetByIdAsync(int id);
        Task<IEnumerable<T>> GetAllAsync();
        Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> expression);

        // FIXED: Add missing async methods that services are trying to use
        Task<T> AddAsync(T entity);
        Task<T> CreateAsync(T entity);
        Task UpdateAsync(T entity);
        Task Update(T entity); // For compatibility with existing service calls
        Task DeleteAsync(int id);
        Task DeleteAsync(T entity);

        // Additional utility methods
        Task<bool> ExistsAsync(int id);
        Task<int> CountAsync();
        Task<int> CountAsync(Expression<Func<T, bool>> expression);
        Task SaveChangesAsync();
    }
}
