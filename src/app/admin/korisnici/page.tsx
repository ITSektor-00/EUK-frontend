'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { apiService } from '../../../services/api';
import AdminDashboardStats from './AdminDashboardStats';

interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  isApproved: boolean;
  createdAt: string;
}

interface PaginationInfo {
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

export default function KorisniciPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('pending');
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    size: 20,
    total: 0,
    totalPages: 0
  });
  
  // Advanced filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  
  // Debounced search term
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  
  // Debounced loadUsers to prevent multiple rapid calls
  const loadUsersTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const loadUsers = async (page: number = 1, resetFilters: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if token exists before making API call
      if (!token) {
        setError('Niste ulogovani. Molimo ulogujte se ponovo.');
        return;
      }
      
      const currentFilters = {
        page: page - 1, // Convert to 0-based indexing for Spring Boot
        size: pagination.size,
        ...(roleFilter && { role: roleFilter }),
        ...(debouncedSearchTerm && { search: debouncedSearchTerm })
      };

      console.log('Loading users with filters:', currentFilters);
      console.log('Original page (1-based):', page);
      console.log('Converted page (0-based):', page - 1);
      console.log('Size:', pagination.size);
      console.log('Full API call parameters:', { page, size: pagination.size, filters: currentFilters });
      const response = await apiService.getUsersWithPagination(token, page, 10000, currentFilters, false, 0); // Uzmi sve korisnike, bez cache-a
      console.log('API response:', response);
      console.log('Response type:', typeof response);
      console.log('Response keys:', Object.keys(response || {}));
      console.log('Response.users exists:', !!response.users);
      console.log('Response.users value:', response.users);
      console.log('Response.totalElements:', response.totalElements);
      console.log('Response.totalPages:', response.totalPages);
      console.log('Response.size:', response.size);
      console.log('Response.number:', response.number);
      
      if (response && response.users && Array.isArray(response.users)) {
        console.log('Setting users from main API (users property):', response.users);
        console.log('Users count from users property:', response.users.length);
        setUsers(response.users);
        setPagination(prev => ({
          ...prev,
          page,
          total: response.total || response.users.length,
          totalPages: response.totalPages || Math.ceil((response.total || response.users.length) / pagination.size)
        }));
      } else if (response && response.content && Array.isArray(response.content)) {
        // Spring Boot Pageable response structure
        console.log('Setting users from main API (content property):', response.content);
        console.log('Users count from content property:', response.content.length);
        setUsers(response.content);
        setPagination(prev => ({
          ...prev,
          page: (response.number || 0) + 1, // Convert from 0-based to 1-based for UI
          total: response.totalElements || response.content.length,
          totalPages: response.totalPages || Math.ceil((response.totalElements || response.content.length) / pagination.size)
        }));
      } else if (response && Array.isArray(response)) {
        // Response is directly an array
        console.log('Response is direct array:', response);
        setUsers(response);
        setPagination(prev => ({
          ...prev,
          page: 1,
          total: response.length,
          totalPages: 1
        }));
      } else {
        // Fallback to old API if new one doesn't work
        console.log('Using fallback API...');
        console.log('Trying getAllUsers without pagination...');
        const fallbackResponse = await apiService.getAllUsers(token, true, 30000); // 30s cache
        console.log('Fallback response:', fallbackResponse);
        console.log('Fallback response type:', typeof fallbackResponse);
        console.log('Fallback response keys:', Object.keys(fallbackResponse || {}));
        
        if (fallbackResponse && fallbackResponse.users && Array.isArray(fallbackResponse.users)) {
          console.log('Setting users from fallback API (users property):', fallbackResponse.users);
          setUsers(fallbackResponse.users);
        } else if (fallbackResponse && fallbackResponse.content && Array.isArray(fallbackResponse.content)) {
          console.log('Setting users from fallback API (content property):', fallbackResponse.content);
          setUsers(fallbackResponse.content);
        } else if (fallbackResponse && Array.isArray(fallbackResponse)) {
          console.log('Fallback response is direct array:', fallbackResponse);
          setUsers(fallbackResponse);
        } else {
          console.log('No valid data found, setting empty array');
          console.log('Trying to load page 0 (Spring Boot uses 0-based indexing)...');
          try {
            const pageZeroFilters = { ...currentFilters, page: 0 };
            const pageZeroResponse = await apiService.getUsersWithPagination(token, 1, pagination.size, pageZeroFilters, true, 30000); // 30s cache
            console.log('Page 0 response:', pageZeroResponse);
            if (pageZeroResponse && pageZeroResponse.content && Array.isArray(pageZeroResponse.content)) {
              console.log('Found data on page 0:', pageZeroResponse.content);
              setUsers(pageZeroResponse.content);
              setPagination(prev => ({
                ...prev,
                page: 1,
                total: pageZeroResponse.totalElements || pageZeroResponse.content.length,
                totalPages: pageZeroResponse.totalPages || 1
              }));
            } else {
              setUsers([]);
            }
          } catch (pageZeroError) {
            console.log('Page 0 also failed:', pageZeroError);
            setUsers([]);
          }
        }
        
        setPagination(prev => ({
          ...prev,
          page: 1,
          total: fallbackResponse?.users?.length || fallbackResponse?.length || 0,
          totalPages: 1
        }));
      }
    } catch (err) {
      console.error('Error loading users:', err);
      if (err instanceof Error) {
        // Handle specific error types
        if (err.message.includes('dozvolu') || err.message.includes('administrator')) {
          setError('Nemate administrator privilegije. Kontaktirajte administratora sistema.');
        } else if (err.message.includes('sesija') || err.message.includes('ulogujte')) {
          setError('Vaša sesija je istekla. Molimo ulogujte se ponovo.');
        } else {
        setError(err.message);
        }
      } else {
        setError('Greška pri učitavanju korisnika');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadUsers(1, true);
    }
  }, [token]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Debounced loadUsers function
  const debouncedLoadUsers = useCallback((page: number = 1, resetFilters: boolean = false) => {
    if (loadUsersTimeoutRef.current) {
      clearTimeout(loadUsersTimeoutRef.current);
    }
    
    loadUsersTimeoutRef.current = setTimeout(() => {
      loadUsers(page, resetFilters);
    }, 2000); // 2000ms debounce to reduce API calls
  }, []);

  // Load users when filters change (using debounced search term)
  useEffect(() => {
    if (token) {
      debouncedLoadUsers(1, false);
    }
    
    // Cleanup timeout on unmount
    return () => {
      if (loadUsersTimeoutRef.current) {
        clearTimeout(loadUsersTimeoutRef.current);
      }
    };
  }, [debouncedSearchTerm, roleFilter, token, debouncedLoadUsers]);

  const handleApprove = async (userId: number) => {
    try {
      setError(null);
      setLoading(true); // Show loading state
      await apiService.approveUser(userId, token!);
      await loadUsers(pagination.page);
    } catch (err) {
      console.error('Error approving user:', err);
      if (err instanceof Error) {
        if (err.message.includes('Previše zahteva')) {
          setError('Previše zahteva. Molimo sačekajte malo pre ponovnog pokušaja.');
        } else if (err.message.includes('Greška na serveru')) {
          setError('Greška na serveru. Molimo pokušajte ponovo kasnije.');
        } else {
        setError(err.message);
        }
      } else {
        setError('Грешка при одобравању корисника');
      }
    } finally {
      setLoading(false); // Hide loading state
    }
  };

  const handleReject = async (userId: number) => {
    try {
      setError(null);
      setLoading(true); // Show loading state
      await apiService.rejectUser(userId, token!);
      await loadUsers(pagination.page);
    } catch (err) {
      console.error('Error rejecting user:', err);
      if (err instanceof Error) {
        if (err.message.includes('Previše zahteva')) {
          setError('Previše zahteva. Molimo sačekajte malo pre ponovnog pokušaja.');
        } else if (err.message.includes('Greška na serveru')) {
          setError('Greška na serveru. Molimo pokušajte ponovo kasnije.');
        } else {
        setError(err.message);
        }
      } else {
        setError('Грешка при одбијању корисника');
      }
    } finally {
      setLoading(false); // Hide loading state
    }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      setError(null);
      setLoading(true); // Show loading state
      await apiService.updateUserRole(userId, newRole, token!);
      // Reload users after successful role change
      await loadUsers(pagination.page);
    } catch (err) {
      console.error('Error updating user role:', err);
      if (err instanceof Error) {
        if (err.message.includes('Previše zahteva')) {
          setError('Previše zahteva. Molimo sačekajte malo pre ponovnog pokušaja.');
        } else if (err.message.includes('Greška na serveru')) {
          setError('Greška na serveru. Molimo pokušajte ponovo kasnije.');
        } else {
        setError(err.message);
        }
      } else {
        setError('Грешка при ажурирању роле корисника');
      }
    } finally {
      setLoading(false); // Hide loading state
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (window.confirm('Да ли сте сигурни да желите да обришете овог корисника?')) {
      try {
        setError(null);
        await apiService.deleteUser(userId, token!);
        await loadUsers(pagination.page);
      } catch (err) {
        console.error('Error deleting user:', err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Грешка при брисању корисника');
        }
      }
    }
  };

  const handlePageChange = (newPage: number) => {
    loadUsers(newPage);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadUsers(1, false);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setRoleFilter('');
    setFilter('all');
  };

  const filteredUsers = users.filter(user => {
    switch (filter) {
      case 'pending':
        return !user.isActive; // Korisnici koji nisu aktivni (na čekanju)
      case 'approved':
        return user.isActive; // Aktivni korisnici (odobreni)
      default:
        return true; // Svi korisnici
    }
  });

  // Debug logging
  console.log('Users state:', users);
  console.log('Filtered users:', filteredUsers);
  console.log('Current filter:', filter);


  const getRoleBadge = (role: string) => {
    const roleColors = {
      'admin': 'bg-purple-100 text-purple-800',
      'korisnik': 'bg-blue-100 text-blue-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${roleColors[role as keyof typeof roleColors] || 'bg-gray-100 text-gray-800'}`}>
        {role}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">УПРАВЉАЊЕ КОРИСНИЦИМА</h1>
        <p className="text-gray-600">Одобравајте и управљајте корисницима система</p>
      </div>

      {/* Admin Dashboard Stats */}
      <AdminDashboardStats users={users} loading={loading} />

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Authentication Status */}
      {!token && (
        <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
          <div className="flex items-center justify-between">
            <div>
              <strong>Niste ulogovani</strong>
              <p className="text-sm mt-1">Da biste pristupili administraciji korisnika, potrebno je da se ulogujete kao administrator.</p>
            </div>
            <a 
              href="/login" 
              className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
            >
              Uloguj se
            </a>
          </div>
        </div>
      )}


      {/* Advanced Search and Filters */}
      <div className={`mb-6 bg-white p-4 rounded-lg shadow relative ${!token ? 'opacity-50 pointer-events-none' : ''}`}>
        {!token && (
          <div className="absolute inset-0 bg-gray-100 bg-opacity-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-600 font-medium">Ulogujte se da biste koristili filtere</p>
          </div>
        )}
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Претрага</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Име, презиме, email..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {/* Role Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Рола</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Све роле</option>
                <option value="admin">Admin</option>
                <option value="korisnik">Korisnik</option>
              </select>
            </div>
            
            {/* Search Button */}
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Претражи
              </button>
            </div>
          </div>
          
          {/* Clear Filters */}
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={clearFilters}
              className="text-gray-600 hover:text-gray-800 text-sm"
            >
              Очисти филтере
            </button>
            
            <div className="text-sm text-gray-500">
              Приказано {users.length} од {pagination.total} корисника
            </div>
          </div>
        </form>
      </div>

      {/* Filter buttons */}
      <div className={`mb-6 flex space-x-2 ${!token ? 'opacity-50 pointer-events-none' : ''}`}>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg ${filter === 'pending' ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          НА ЧЕКАЊУ ({users.filter(u => !u.isActive).length})
        </button>
        <button
          onClick={() => setFilter('approved')}
          className={`px-4 py-2 rounded-lg ${filter === 'approved' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          ОДОБРЕНИ ({users.filter(u => u.isActive).length})
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          СВИ ({users.length})
        </button>
      </div>

      {/* Users table */}
      <div className={`bg-white rounded-lg shadow overflow-hidden relative ${!token ? 'opacity-50 pointer-events-none' : ''}`}>
        {!token && (
          <div className="absolute inset-0 bg-gray-100 bg-opacity-50 rounded-lg flex items-center justify-center z-10">
            <p className="text-gray-600 font-medium">Ulogujte se da biste videli korisnike</p>
          </div>
        )}
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                КОРИСНИК
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ЕМАИЛ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                УЛОГА
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ДАТУМ РЕГИСТРАЦИЈЕ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                АКЦИЈЕ
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {user.firstName} {user.lastName}
                    </div>
                    <div className="text-sm text-gray-500">@{user.username}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="admin">Admin</option>
                    <option value="korisnik">Korisnik</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString('sr-Latn-RS')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  {/* Neaktivni korisnici (na čekanju) - mogu da se odobre ili obrišu */}
                  {!user.isActive && (
                    <>
                      <button
                        onClick={() => handleApprove(user.id)}
                        className="text-green-600 hover:text-green-900 bg-green-100 hover:bg-green-200 px-3 py-1 rounded-md transition-colors"
                      >
                        ОДОБРИ
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 px-3 py-1 rounded-md transition-colors ml-2"
                      >
                        ОБРИШИ
                      </button>
                    </>
                  )}
                  {/* Aktivni korisnici (odobreni) - mogu da se obrišu */}
                  {user.isActive && (
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 px-3 py-1 rounded-md transition-colors"
                    >
                      ОБРИШИ
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {!token ? (
              <div>
                <p className="text-lg font-medium mb-2">Niste ulogovani</p>
                <p className="mb-4">Da biste videli korisnike, potrebno je da se ulogujete kao administrator.</p>
                <a 
                  href="/login" 
                  className="inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Uloguj se
                </a>
              </div>
            ) : (
              'Нема корисника за приказ са тренутним филтером.'
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className={`mt-6 flex justify-center ${!token ? 'opacity-50 pointer-events-none' : ''}`}>
          <nav className="flex space-x-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Претходна
            </button>
            
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  pageNum === pagination.page
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {pageNum}
              </button>
            ))}
            
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Следећа
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}
