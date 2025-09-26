import { BaseViewModel } from './BaseViewModel';
import { IDatabaseService } from '../services/databaseService';

export interface KategorijaData {
  kategorijaId: number;
  naziv: string;
  opis: string;
  aktivna: boolean;
  datumKreiranja: string;
}

export class KategorijaViewModel extends BaseViewModel<KategorijaData> {
  constructor(db: IDatabaseService, data: KategorijaData) {
    super(db, data);
  }

  protected async performUpdate(): Promise<void> {
    await this.db.updateKategorija(this.data);
  }

  // Getters i setters sa automatskim ažuriranjem
  get kategorijaId(): number {
    return this.data.kategorijaId;
  }

  get naziv(): string {
    return this.data.naziv;
  }

  set naziv(value: string) {
    this.updateData(() => {
      this.data.naziv = value;
    });
  }

  get opis(): string {
    return this.data.opis;
  }

  set opis(value: string) {
    this.updateData(() => {
      this.data.opis = value;
    });
  }

  get aktivna(): boolean {
    return this.data.aktivna;
  }

  set aktivna(value: boolean) {
    this.updateData(() => {
      this.data.aktivna = value;
    });
  }

  get datumKreiranja(): string {
    return this.data.datumKreiranja;
  }

  set datumKreiranja(value: string) {
    this.updateData(() => {
      this.data.datumKreiranja = value;
    });
  }
}
