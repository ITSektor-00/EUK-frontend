import { apiService } from './api';

// Base interface za sve database operacije
export interface IDatabaseService {
  updateUgrozenoLice(data: any): Promise<void>;
  updatePredmet(data: any): Promise<void>;
  updateKategorija(data: any): Promise<void>;
  updateUgrozenoLiceT2(data: any): Promise<void>;
}

// Implementacija database servisa
export class DatabaseService implements IDatabaseService {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  async updateUgrozenoLice(data: any): Promise<void> {
    try {
      await apiService.updateUgrozenoLice(data.ugrozenoLiceId, data, this.token);
    } catch (error) {
      console.error('Greška pri ažuriranju ugroženog lica:', error);
      throw error;
    }
  }

  async updatePredmet(data: any): Promise<void> {
    try {
      await apiService.updatePredmet(data.predmetId, data, this.token);
    } catch (error) {
      console.error('Greška pri ažuriranju predmeta:', error);
      throw error;
    }
  }

  async updateKategorija(data: any): Promise<void> {
    try {
      await apiService.updateKategorija(data.kategorijaId, data, this.token);
    } catch (error) {
      console.error('Greška pri ažuriranju kategorije:', error);
      throw error;
    }
  }

  async updateUgrozenoLiceT2(data: any): Promise<void> {
    try {
      await apiService.updateUgrozenoLiceT2(data.ugrozenoLiceId, data, this.token);
    } catch (error) {
      console.error('Greška pri ažuriranju ugroženog lica T2:', error);
      throw error;
    }
  }
}
