using AgroConectaMantaro.Application.Interfaces;
using AgroConectaMantaro.Domain.Entities;
using AgroConectaMantaro.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AgroConectaMantaro.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly AppDbContext _context;

    public UserRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _context.Users
            .FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());
    }

    public async Task<User?> GetByIdAsync(int id)
    {
        return await _context.Users.FindAsync(id);
    }

    public async Task<IEnumerable<User>> GetAllAsync()
    {
        return await _context.Users.OrderBy(u => u.Id).ToListAsync();
    }
}
