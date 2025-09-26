import { DatabaseService } from '../services/databaseService';
import { UgrozenoLiceViewModel, UgrozenoLiceData } from './UgrozenoLiceViewModel';
import { PredmetViewModel, PredmetData } from './PredmetViewModel';
import { KategorijaViewModel, KategorijaData } from './KategorijaViewModel';
import { UgrozenoLiceT2ViewModel, UgrozenoLiceT2Data } from './UgrozenoLiceT2ViewModel';

export class ViewModelFactory {
  private static dbService: DatabaseService | null = null;

  static initialize(token: string): void {
    this.dbService = new DatabaseService(token);
  }

  static createUgrozenoLiceViewModel(data: UgrozenoLiceData): UgrozenoLiceViewModel {
    if (!this.dbService) {
      throw new Error('ViewModelFactory nije inicijalizovan. Pozovite initialize() prvo.');
    }
    return new UgrozenoLiceViewModel(this.dbService, data);
  }

  static createPredmetViewModel(data: PredmetData): PredmetViewModel {
    if (!this.dbService) {
      throw new Error('ViewModelFactory nije inicijalizovan. Pozovite initialize() prvo.');
    }
    return new PredmetViewModel(this.dbService, data);
  }

  static createKategorijaViewModel(data: KategorijaData): KategorijaViewModel {
    if (!this.dbService) {
      throw new Error('ViewModelFactory nije inicijalizovan. Pozovite initialize() prvo.');
    }
    return new KategorijaViewModel(this.dbService, data);
  }

  static createUgrozenoLiceT2ViewModel(data: UgrozenoLiceT2Data): UgrozenoLiceT2ViewModel {
    if (!this.dbService) {
      throw new Error('ViewModelFactory nije inicijalizovan. Pozovite initialize() prvo.');
    }
    return new UgrozenoLiceT2ViewModel(this.dbService, data);
  }

  // Metoda za kreiranje ViewModel niza za sve entitete
  static createUgrozenoLiceViewModels(dataArray: UgrozenoLiceData[]): UgrozenoLiceViewModel[] {
    return dataArray.map(data => this.createUgrozenoLiceViewModel(data));
  }

  static createPredmetViewModels(dataArray: PredmetData[]): PredmetViewModel[] {
    return dataArray.map(data => this.createPredmetViewModel(data));
  }

  static createKategorijaViewModels(dataArray: KategorijaData[]): KategorijaViewModel[] {
    return dataArray.map(data => this.createKategorijaViewModel(data));
  }

  static createUgrozenoLiceT2ViewModels(dataArray: UgrozenoLiceT2Data[]): UgrozenoLiceT2ViewModel[] {
    return dataArray.map(data => this.createUgrozenoLiceT2ViewModel(data));
  }
}
