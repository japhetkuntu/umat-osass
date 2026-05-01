using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using Umat.Osass.PostgresDb.Sdk.Models;

namespace Umat.Osass.PostgresDb.Sdk.Repository.Interfaces;

public interface IPgRepository<T,TContext>  where T : class 
    where TContext : DbContext
{
    Task<IEnumerable<T>> GetAllAsync(Expression<Func<T, bool>>? predicate = null);
    Task<T?> GetOneAsync(Expression<Func<T, bool>> predicate);
    public Task<T?> GetByIdAsync(string id);
    public Task<int> AddAsync(T entity);
    public Task<int> AddRangeAsync(List<T> entity);
    public Task<int> Remove(T entity);
    public Task<int> UpdateAsync(T entity);
    public Task<int> UpdateRangeAsync(List<T> entities);
    IQueryable<T> GetQueryableAsync(Expression<Func<T, bool>>? predicate = null);
    Task<int> Count(Expression<Func<T, bool>>? predicate = null);

    Task<PgPagedResult<T>> GetPagedAsync(
        int pageIndex,
        int pageSize,
        string sortColumn = "Id",
        string sortDir = "desc",
        Expression<Func<T, bool>>? filter = null);

}