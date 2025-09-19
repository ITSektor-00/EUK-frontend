// Role-based Route Service
class RouteService {
  private static baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080/api';

  // Dohvati rute dostupne korisniku na osnovu role
  static async getAccessibleRoutes(userId: number, token: string): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/admin/accessible-routes/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching accessible routes:', error);
      // Fallback na role-based rute
      return this.getFallbackRoutesForUser(userId);
    }
  }

  // Dohvati user-routes dostupne korisniku
  static async getAccessibleUserRoutes(userId: number, token: string): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/admin/accessible-user-routes/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching accessible user routes:', error);
      return [];
    }
  }

  // Dodeli rutu korisniku (admin može da dodeli bilo koju rutu bilo kom korisniku)
  static async assignRoute(userId: number, routeId: number, token: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/admin/assign-route`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, routeId })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error assigning route:', error);
      throw error;
    }
  }

  // Ukloni rutu od korisnika
  static async removeRoute(userId: number, routeId: number, token: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/admin/user-routes/${userId}/${routeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Error removing route:', error);
      return false;
    }
  }

  // Proveri pristup sekciji
  static async checkSectionAccess(userId: number, section: string, token: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/admin/check-section-access/${userId}/${section}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        return false;
      }

      return await response.json();
    } catch (error) {
      console.error('Error checking section access:', error);
      return false;
    }
  }

  // Proveri pristup ruti
  static async checkRouteAccess(userId: number, routeId: number, token: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/user-routes/${userId}/check/${routeId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        return false;
      }

      return await response.json();
    } catch (error) {
      console.error('Error checking route access:', error);
      return false;
    }
  }

  // Fallback rute na osnovu role korisnika
  private static getFallbackRoutesForUser(_userId: number): any[] {
    // Ovo će biti implementirano kada budemo imali user data
    return [];
  }

  // Role-based route mapping
  static getRoleBasedRoutes(role: string): string[] {
    const roleRoutes: { [key: string]: string[] } = {
      'ADMIN': [], // ADMIN ne koristi EUK sekciju - samo admin panel
      'OBRADJIVAC': ['euk/kategorije', 'euk/predmeti', 'euk/ugrozena-lica', 'euk/stampanje'],
      'POTPISNIK': ['euk/stampanje']
    };

    return roleRoutes[role] || [];
  }

  // Proveri da li korisnik ima pristup sekciji na osnovu role
  static hasAccessToSection(userRole: string, section: string): boolean {
    const role = userRole?.toUpperCase();
    
    if (role === 'ADMIN') {
      return section === 'ADMIN'; // ADMIN ima pristup samo ADMIN sekcijama
    }
    
    return section === 'EUK'; // Ostali korisnici imaju pristup samo EUK sekciji
  }

  // Dohvati sve dostupne rute za admin panel
  static async getAllRoutes(token: string): Promise<any[]> {
    try {
      // Koristi postojeći backend endpoint
      const response = await fetch(`${this.baseUrl}/routes`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching all routes:', error);
      
      // Fallback rute
      return [
        {
          id: 1,
          ruta: 'euk/kategorije',
          naziv: 'Kategorije',
          opis: 'Upravljanje kategorijama u EUK sistemu',
          sekcija: 'EUK',
          nivoMin: 2,
          nivoMax: 5,
          aktivna: true,
          datumKreiranja: new Date().toISOString()
        },
        {
          id: 2,
          ruta: 'euk/predmeti',
          naziv: 'Predmeti',
          opis: 'Upravljanje predmetima u EUK sistemu',
          sekcija: 'EUK',
          nivoMin: 2,
          nivoMax: 5,
          aktivna: true,
          datumKreiranja: new Date().toISOString()
        },
        {
          id: 3,
          ruta: 'euk/ugrozena-lica',
          naziv: 'Ugrožena lica',
          opis: 'Upravljanje ugroženim licima u EUK sistemu',
          sekcija: 'EUK',
          nivoMin: 2,
          nivoMax: 5,
          aktivna: true,
          datumKreiranja: new Date().toISOString()
        },
        {
          id: 4,
          ruta: 'euk/stampanje',
          naziv: 'Štampanje',
          opis: 'Štampanje dokumenata u EUK sistemu',
          sekcija: 'EUK',
          nivoMin: 2,
          nivoMax: 5,
          aktivna: true,
          datumKreiranja: new Date().toISOString()
        },
        {
          id: 5,
          ruta: 'admin/korisnici',
          naziv: 'Admin Korisnici',
          opis: 'Administracija korisnika',
          sekcija: 'ADMIN',
          nivoMin: 5,
          nivoMax: 5,
          aktivna: true,
          datumKreiranja: new Date().toISOString()
        },
        {
          id: 6,
          ruta: 'admin/sistem',
          naziv: 'Admin Sistem',
          opis: 'Administracija sistema',
          sekcija: 'ADMIN',
          nivoMin: 5,
          nivoMax: 5,
          aktivna: true,
          datumKreiranja: new Date().toISOString()
        }
      ];
    }
  }

  // Dohvati sve korisnike za admin panel
  static async getAllUsers(token: string): Promise<any[]> {
    try {
      // Koristi postojeći backend endpoint
      const response = await fetch(`${this.baseUrl}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.content || data; // Handle pagination response
    } catch (error) {
      console.error('Error fetching all users:', error);
      
      // Fallback korisnici
      return [
        {
          id: 1,
          firstName: 'Admin',
          lastName: 'User',
          username: 'admin',
          email: 'admin@euk.rs',
          role: 'ADMIN',
          isActive: true,
          nivoPristupa: 5,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 2,
          firstName: 'Marko',
          lastName: 'Petrović',
          username: 'marko.petrovic',
          email: 'marko@euk.rs',
          role: 'OBRADJIVAC',
          isActive: true,
          nivoPristupa: 3,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 3,
          firstName: 'Ana',
          lastName: 'Nikolić',
          username: 'ana.nikolic',
          email: 'ana@euk.rs',
          role: 'POTPISNIK',
          isActive: true,
          nivoPristupa: 2,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
    }
  }
}

export default RouteService;
