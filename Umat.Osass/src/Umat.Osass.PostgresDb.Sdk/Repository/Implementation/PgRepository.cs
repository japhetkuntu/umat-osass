using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using Umat.Osass.PostgresDb.Sdk.Models;
using Umat.Osass.PostgresDb.Sdk.Repository.Interfaces;

namespace Umat.Osass.PostgresDb.Sdk.Repository.Implementation;

public class PgRepository<T,TContext> : IPgRepository<T,TContext> where T : class 
    where TContext : DbContext
{
    private readonly TContext _context;
    private readonly DbSet<T> _dbSet;

    public PgRepository(TContext context)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _dbSet = _context.Set<T>();
    }

    public async Task<IEnumerable<T>> GetAllAsync(Expression<Func<T, bool>>? predicate = null)
    {
        if (predicate == null)
        {
            return await _dbSet.ToListAsync();
        }

        return await _dbSet.Where(predicate).ToListAsync();
    }
    public async Task<int> Count(Expression<Func<T, bool>>? predicate = null)
    {
        if (predicate == null)
        {
            return await _dbSet.CountAsync();
        }

        return await _dbSet.Where(predicate).CountAsync();
    }
    public async Task<T?> GetByIdAsync(string id) => await _dbSet.FindAsync(id);

    public async Task<int> AddAsync(T entity)
    {
        await _dbSet.AddAsync(entity);

        var response = await _context.SaveChangesAsync();
        return response;

    }
    public async Task<int> AddRangeAsync(List<T> entity)
    {
        await _dbSet.AddRangeAsync(entity);

        var response = await _context.SaveChangesAsync();
        return response;

    }
    public async Task<T?> GetOneAsync(Expression<Func<T, bool>> predicate)
    {
        return await _dbSet.FirstOrDefaultAsync(predicate);
    }
    public IQueryable<T> GetQueryableAsync(Expression<Func<T, bool>>? predicate = null)
    {
        if (predicate == null)
        {
            return _dbSet.AsQueryable();
        }

        return _dbSet.Where(predicate).AsQueryable();
    }

    public async Task<int> Remove(T entity)
    {
        _dbSet.Remove(entity);
        return await _context.SaveChangesAsync();
    }
    public async Task<int> UpdateAsync(T entity)
    {
        _dbSet.Update(entity);
        return await _context.SaveChangesAsync();
    }
    
    public async Task<int> UpdateRangeAsync(List<T> entities)
    {
        _dbSet.UpdateRange(entities);
        return await _context.SaveChangesAsync();
    }
    public async Task<PgPagedResult<T>> GetPagedAsync(
        int pageIndex,
        int pageSize,
        string sortColumn = "Id",
        string sortDir = "desc",
        Expression<Func<T, bool>>? filter = null)
    {
        filter ??= _ => true;

        var query = _dbSet.Where(filter);

        // Sorting dynamically
        if (!string.IsNullOrEmpty(sortColumn))
        {
            query = ApplySorting(query, sortColumn, sortDir);
        }

        var totalCount = await query.CountAsync();

        var results = await query
            .Skip((pageIndex - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PgPagedResult<T>(results, pageIndex, pageSize, totalCount);
    }
    private static IQueryable<T> ApplySorting<T>(
        IQueryable<T> query,
        string sortColumn,
        string sortDir)
    {
        var parameter = Expression.Parameter(typeof(T), "x");
        var property = Expression.PropertyOrField(parameter, sortColumn);
        var lambda = Expression.Lambda(property, parameter);

        var methodName = sortDir.ToLower() == "desc" ? "OrderByDescending" : "OrderBy";

        var method = typeof(Queryable).GetMethods()
            .First(m => m.Name == methodName 
                        && m.GetParameters().Length == 2)
            .MakeGenericMethod(typeof(T), property.Type);

        return (IQueryable<T>)method.Invoke(null, [query, lambda])!;
    }


}