import { BaseViewModel } from './BaseViewModel';
import { IDatabaseService } from '../services/databaseService';

export interface PredmetData {
  predmetId: number;
  nazivPredmeta: string;
  status: string;
  prioritet: string;
  kategorijaId: number;
  opis: string;
  datumKreiranja: string;
  datumZavrsetka?: string;
}

export class PredmetViewModel extends BaseViewModel<PredmetData> {
  constructor(db: IDatabaseService, data: PredmetData) {
    super(db, data);
  }

  protected async performUpdate(): Promise<void> {
    await this.db.updatePredmet(this.data);
  }

  // Getters i setters sa automatskim ažuriranjem
  get predmetId(): number {
    return this.data.predmetId;
  }

  get nazivPredmeta(): string {
    return this.data.nazivPredmeta;
  }

  set nazivPredmeta(value: string) {
    this.updateData(() => {
      this.data.nazivPredmeta = value;
    });
  }

  get status(): string {
    return this.data.status;
  }

  set status(value: string) {
    this.updateData(() => {
      this.data.status = value;
    });
  }

  get prioritet(): string {
    return this.data.prioritet;
  }

  set prioritet(value: string) {
    this.updateData(() => {
      this.data.prioritet = value;
    });
  }

  get kategorijaId(): number {
    return this.data.kategorijaId;
  }

  set kategorijaId(value: number) {
    this.updateData(() => {
      this.data.kategorijaId = value;
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

  get datumKreiranja(): string {
    return this.data.datumKreiranja;
  }

  set datumKreiranja(value: string) {
    this.updateData(() => {
      this.data.datumKreiranja = value;
    });
  }

  get datumZavrsetka(): string | undefined {
    return this.data.datumZavrsetka;
  }

  set datumZavrsetka(value: string | undefined) {
    this.updateData(() => {
      this.data.datumZavrsetka = value;
    });
  }
}
