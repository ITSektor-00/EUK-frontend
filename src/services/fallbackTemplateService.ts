/**
 * Fallback template service koji koristi mock podatke
 * Aktivira se kada optimizovani servis ne radi
 */
class FallbackTemplateService {
  /**
   * Mock kategorije
   */
  async getKategorije() {
    console.log('[Fallback] Using mock kategorije');
    return [
      { id: 1, naziv: 'Kategorija 1', opis: 'Opis kategorije 1' },
      { id: 2, naziv: 'Kategorija 2', opis: 'Opis kategorije 2' },
      { id: 3, naziv: 'Kategorija 3', opis: 'Opis kategorije 3' },
      { id: 4, naziv: 'Kategorija 4', opis: 'Opis kategorije 4' },
      { id: 5, naziv: 'Kategorija 5', opis: 'Opis kategorije 5' }
    ];
  }

  /**
   * Mock obrasci vrste
   */
  async getObrasciVrste() {
    console.log('[Fallback] Using mock obrasci vrste');
    return [
      { 
        id: 1, 
        naziv: 'negativno', 
        opis: 'Negativni obrasci', 
        createdAt: new Date().toISOString(), 
        updatedAt: new Date().toISOString() 
      },
      { 
        id: 2, 
        naziv: 'neograniceno', 
        opis: 'Neograničeni obrasci', 
        createdAt: new Date().toISOString(), 
        updatedAt: new Date().toISOString() 
      },
      { 
        id: 3, 
        naziv: 'ograniceno', 
        opis: 'Ograničeni obrasci', 
        createdAt: new Date().toISOString(), 
        updatedAt: new Date().toISOString() 
      },
      { 
        id: 4, 
        naziv: 'borci', 
        opis: 'Obrasci za borce', 
        createdAt: new Date().toISOString(), 
        updatedAt: new Date().toISOString() 
      },
      { 
        id: 5, 
        naziv: 'penzioneri', 
        opis: 'Obrasci za penzionere', 
        createdAt: new Date().toISOString(), 
        updatedAt: new Date().toISOString() 
      }
    ];
  }

  /**
   * Mock organizaciona struktura
   */
  async getOrganizacionaStruktura() {
    console.log('[Fallback] Using mock organizaciona struktura');
    return [
      { 
        id: 1, 
        naziv: 'sekretar', 
        opis: 'Sekretar', 
        createdAt: new Date().toISOString(), 
        updatedAt: new Date().toISOString() 
      },
      { 
        id: 2, 
        naziv: 'podsekretar', 
        opis: 'Podsekretar', 
        createdAt: new Date().toISOString(), 
        updatedAt: new Date().toISOString() 
      },
      { 
        id: 3, 
        naziv: 'direktor', 
        opis: 'Direktor', 
        createdAt: new Date().toISOString(), 
        updatedAt: new Date().toISOString() 
      }
    ];
  }

  /**
   * Mock predmeti
   */
  async getPredmeti() {
    console.log('[Fallback] Using mock predmeti');
    return [
      { id: 1, naziv: 'Predmet 1', opis: 'Opis predmeta 1' },
      { id: 2, naziv: 'Predmet 2', opis: 'Opis predmeta 2' },
      { id: 3, naziv: 'Predmet 3', opis: 'Opis predmeta 3' }
    ];
  }

  /**
   * Mock T1 lice
   */
  async getT1Lice() {
    console.log('[Fallback] Using mock T1 lice');
    return [
      { id: 1, ime: 'Marko', prezime: 'Marković', jmbg: '1234567890123', tip: 't1' },
      { id: 2, ime: 'Petar', prezime: 'Petrović', jmbg: '1234567890124', tip: 't1' },
      { id: 3, ime: 'Ana', prezime: 'Anić', jmbg: '1234567890125', tip: 't1' },
      { id: 4, ime: 'Milica', prezime: 'Milić', jmbg: '1234567890126', tip: 't1' },
      { id: 5, ime: 'Stefan', prezime: 'Stefanović', jmbg: '1234567890127', tip: 't1' }
    ];
  }

  /**
   * Mock T2 lice
   */
  async getT2Lice() {
    console.log('[Fallback] Using mock T2 lice');
    return [
      { id: 6, ime: 'Jovan', prezime: 'Jovanović', jmbg: '1234567890128', tip: 't2' },
      { id: 7, ime: 'Milica', prezime: 'Milić', jmbg: '1234567890129', tip: 't2' },
      { id: 8, ime: 'Stefan', prezime: 'Stefanović', jmbg: '1234567890130', tip: 't2' },
      { id: 9, ime: 'Nina', prezime: 'Ninić', jmbg: '1234567890131', tip: 't2' },
      { id: 10, ime: 'Aleksandar', prezime: 'Aleksić', jmbg: '1234567890132', tip: 't2' }
    ];
  }

  /**
   * Load all data sa fallback logikom
   */
  async loadAllData() {
    console.log('[Fallback] Loading all mock data...');
    
    try {
      const [kategorije, obrasciVrste, organizacionaStruktura, predmeti, t1Lice, t2Lice] = await Promise.all([
        this.getKategorije(),
        this.getObrasciVrste(),
        this.getOrganizacionaStruktura(),
        this.getPredmeti(),
        this.getT1Lice(),
        this.getT2Lice()
      ]);

      const result = {
        kategorije,
        obrasciVrste,
        organizacionaStruktura,
        predmeti,
        t1Lice,
        t2Lice
      };

      console.log('[Fallback] Loaded mock data successfully:', {
        kategorije: result.kategorije.length,
        obrasciVrste: result.obrasciVrste.length,
        organizacionaStruktura: result.organizacionaStruktura.length,
        predmeti: result.predmeti.length,
        t1Lice: result.t1Lice.length,
        t2Lice: result.t2Lice.length
      });

      return result;
    } catch (error) {
      console.error('[Fallback] Error loading mock data:', error);
      throw error;
    }
  }

  /**
   * Vrati informacije o fallback servisu
   */
  getServiceInfo() {
    return {
      name: 'Fallback Template Service',
      description: 'Koristi mock podatke kada optimizovani servis ne radi',
      isFallback: true,
      mockDataAvailable: true
    };
  }
}

const fallbackTemplateService = new FallbackTemplateService();
export default fallbackTemplateService;
