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
  const [actionLoading, setActionLoading] = useState<{ [key: number]: string }>({});
  
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
        ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
        // Add filter for user status
        ...(filter === 'pending' && { isActive: false }),
        ...(filter === 'approved' && { isActive: true })
      };

      // Pojednostavljen API poziv
      const response = await apiService.getUsersWithPagination(token, page, pagination.size, currentFilters, false, 0);
      
      // Pojednostavljena logika za rukovanje odgovorom
      if (response && response.users && Array.isArray(response.users)) {
        setUsers(response.users);
        setPagination(prev => ({
          ...prev,
          page,
          total: response.total || response.users.length,
          totalPages: response.totalPages || Math.ceil((response.total || response.users.length) / pagination.size)
        }));
      } else if (response && response.content && Array.isArray(response.content)) {
        setUsers(response.content);
        setPagination(prev => ({
          ...prev,
          page: (response.number || 0) + 1,
          total: response.totalElements || response.content.length,
          totalPages: response.totalPages || Math.ceil((response.totalElements || response.content.length) / pagination.size)
        }));
      } else if (response && Array.isArray(response)) {
        setUsers(response);
        setPagination(prev => ({
          ...prev,
          page: 1,
          total: response.length,
          totalPages: 1
        }));
      } else {
        // Ako nema podataka, postavi prazan niz
        setUsers([]);
        setPagination(prev => ({
          ...prev,
          page: 1,
          total: 0,
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

  // Load users when filters change (using debounced search term)
  useEffect(() => {
    if (token) {
      // Direktno pozovi loadUsers bez debounce-a da izbegnemo probleme
      loadUsers(1, false);
    }
  }, [debouncedSearchTerm, roleFilter, token]);

  // Load users when filter changes
  useEffect(() => {
    if (token) {
      loadUsers(1, false);
    }
  }, [filter, token]);

  const handleApprove = async (userId: number) => {
    try {
      console.log('Approving user:', userId);
      setError(null);
      setActionLoading(prev => ({ ...prev, [userId]: 'approve' }));
      
      const result = await apiService.approveUser(userId, token!);
      console.log('Approve result:', result);
      
      await loadUsers(pagination.page);
      console.log('Users reloaded after approval');
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
      setActionLoading(prev => {
        const newState = { ...prev };
        delete newState[userId];
        return newState;
      });
    }
  };

  const handleReject = async (userId: number) => {
    try {
      console.log('Rejecting user:', userId);
      setError(null);
      setActionLoading(prev => ({ ...prev, [userId]: 'reject' }));
      
      const result = await apiService.rejectUser(userId, token!);
      console.log('Reject result:', result);
      
      await loadUsers(pagination.page);
      console.log('Users reloaded after rejection');
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
      setActionLoading(prev => {
        const newState = { ...prev };
        delete newState[userId];
        return newState;
      });
    }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      setError(null);
      setActionLoading(prev => ({ ...prev, [userId]: 'role' }));
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
      setActionLoading(prev => {
        const newState = { ...prev };
        delete newState[userId];
        return newState;
      });
    }
  };

  const handleDeleteUser = async (userId: number) => {
    try {
      console.log('Deleting user:', userId);
      setError(null);
      setActionLoading(prev => ({ ...prev, [userId]: 'delete' }));
      
      const result = await apiService.deleteUser(userId, token!);
      console.log('Delete result:', result);
      
      await loadUsers(pagination.page);
      console.log('Users reloaded after deletion');
    } catch (err) {
      console.error('Error deleting user:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Грешка при брисању корисника');
      }
    } finally {
      setActionLoading(prev => {
        const newState = { ...prev };
        delete newState[userId];
        return newState;
      });
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

  // Use users directly since backend filtering is now handled
  const filteredUsers = users;

  // Debug logging - uklonjen da smanjimo opterećenje


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
          НА ЧЕКАЊУ
        </button>
        <button
          onClick={() => setFilter('approved')}
          className={`px-4 py-2 rounded-lg ${filter === 'approved' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          ОДОБРЕНИ
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          СВИ
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
                    disabled={actionLoading[user.id] === 'role'}
                    className={`text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      actionLoading[user.id] === 'role' ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                  >
                    <option value="admin">Admin</option>
                    <option value="korisnik">Korisnik</option>
                  </select>
                  {actionLoading[user.id] === 'role' && (
                    <span className="ml-2 text-xs text-gray-500">Ажурирам...</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString('sr-Latn-RS')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  {/* Neaktivni korisnici (na čekanju) - samo odobri ili odbij */}
                  {!user.isActive && (
                    <>
                      <button
                        onClick={() => {
                          console.log('ODOBRI button clicked for user:', user.id);
                          handleApprove(user.id);
                        }}
                        disabled={actionLoading[user.id] === 'approve'}
                        className={`px-3 py-1 rounded-md transition-colors ${
                          actionLoading[user.id] === 'approve'
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'text-green-600 hover:text-green-900 bg-green-100 hover:bg-green-200'
                        }`}
                      >
                        {actionLoading[user.id] === 'approve' ? 'Одобравам...' : 'ОДОБРИ'}
                      </button>
                      <button
                        onClick={() => {
                          console.log('ODBIJ button clicked for user:', user.id);
                          if (window.confirm('Да ли сте сигурни да желите да одбијете овог корисника? Ова акција ће обрисати корисника из базе.')) {
                            handleDeleteUser(user.id);
                          }
                        }}
                        disabled={actionLoading[user.id] === 'delete'}
                        className={`px-3 py-1 rounded-md transition-colors ml-2 ${
                          actionLoading[user.id] === 'delete'
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'text-orange-600 hover:text-orange-900 bg-orange-100 hover:bg-orange-200'
                        }`}
                      >
                        {actionLoading[user.id] === 'delete' ? 'Одбијам...' : 'ОДБИЈ'}
                      </button>
                    </>
                  )}
                  {/* Aktivni korisnici - mogu da se deaktiviraju ili obrišu */}
                  {user.isActive && (
                    <>
                      <button
                        onClick={() => {
                          console.log('DEAKTIVIRAJ button clicked for user:', user.id);
                          handleReject(user.id);
                        }}
                        disabled={actionLoading[user.id] === 'reject'}
                        className={`px-3 py-1 rounded-md transition-colors ${
                          actionLoading[user.id] === 'reject'
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'text-orange-600 hover:text-orange-900 bg-orange-100 hover:bg-orange-200'
                        }`}
                      >
                        {actionLoading[user.id] === 'reject' ? 'Деактивирам...' : 'ДЕАКТИВИРАЈ'}
                      </button>
                      <button
                        onClick={() => {
                          console.log('OBRISI button clicked for user:', user.id);
                          if (window.confirm('Да ли сте сигурни да желите да обришете овог корисника?')) {
                            handleDeleteUser(user.id);
                          }
                        }}
                        disabled={actionLoading[user.id] === 'delete'}
                        className={`px-3 py-1 rounded-md transition-colors ml-2 ${
                          actionLoading[user.id] === 'delete'
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200'
                        }`}
                      >
                        {actionLoading[user.id] === 'delete' ? 'Бришем...' : 'ОБРИШИ'}
                      </button>
                    </>
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
