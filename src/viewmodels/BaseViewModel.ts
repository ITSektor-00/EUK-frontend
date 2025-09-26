import { IDatabaseService } from '../services/databaseService';

// Base ViewModel klasa sa zajedničkom funkcionalnošću
export abstract class BaseViewModel<T> {
  protected db: IDatabaseService;
  protected data: T;
  protected isUpdating: boolean = false;

  constructor(db: IDatabaseService, data: T) {
    this.db = db;
    this.data = data;
  }

  // Metoda za ažuriranje podataka
  protected async updateData(updateFn: () => void): Promise<void> {
    if (this.isUpdating) return;
    
    this.isUpdating = true;
    try {
      updateFn();
      await this.performUpdate();
    } catch (error) {
      console.error('Greška pri ažuriranju podataka:', error);
      throw error;
    } finally {
      this.isUpdating = false;
    }
  }

  // Apstraktna metoda koju svaki ViewModel mora da implementira
  protected abstract performUpdate(): Promise<void>;

  // Getter za originalne podatke
  get originalData(): T {
    return this.data;
  }

  // Metoda za ažuriranje celih podataka
  async updateAllData(newData: T): Promise<void> {
    this.data = newData;
    await this.performUpdate();
  }
}
