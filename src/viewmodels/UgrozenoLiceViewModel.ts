import { BaseViewModel } from './BaseViewModel';
import { IDatabaseService } from '../services/databaseService';

export interface UgrozenoLiceData {
  ugrozenoLiceId: number;
  ime: string;
  prezime: string;
  jmbg: string;
  datumIzdavanjaRacuna: string;
  brojClanovaDomacinstva: number;
  potrosnjaKwh: number;
  zagrevanaPovrsinaM2: number;
  iznosUmanjenjaSaPdv: number;
  predmetId: number;
}

export class UgrozenoLiceViewModel extends BaseViewModel<UgrozenoLiceData> {
  constructor(db: IDatabaseService, data: UgrozenoLiceData) {
    super(db, data);
  }

  protected async performUpdate(): Promise<void> {
    await this.db.updateUgrozenoLice(this.data);
  }

  // Getters i setters sa automatskim ažuriranjem
  get ugrozenoLiceId(): number {
    return this.data.ugrozenoLiceId;
  }

  get ime(): string {
    return this.data.ime;
  }

  set ime(value: string) {
    this.updateData(() => {
      this.data.ime = value;
    });
  }

  get prezime(): string {
    return this.data.prezime;
  }

  set prezime(value: string) {
    this.updateData(() => {
      this.data.prezime = value;
    });
  }

  get jmbg(): string {
    return this.data.jmbg;
  }

  set jmbg(value: string) {
    this.updateData(() => {
      this.data.jmbg = value;
    });
  }

  get datumIzdavanjaRacuna(): string {
    return this.data.datumIzdavanjaRacuna;
  }

  set datumIzdavanjaRacuna(value: string) {
    this.updateData(() => {
      this.data.datumIzdavanjaRacuna = value;
    });
  }

  get brojClanovaDomacinstva(): number {
    return this.data.brojClanovaDomacinstva;
  }

  set brojClanovaDomacinstva(value: number) {
    this.updateData(() => {
      this.data.brojClanovaDomacinstva = value;
    });
  }

  get potrosnjaKwh(): number {
    return this.data.potrosnjaKwh;
  }

  set potrosnjaKwh(value: number) {
    this.updateData(() => {
      this.data.potrosnjaKwh = value;
    });
  }

  get zagrevanaPovrsinaM2(): number {
    return this.data.zagrevanaPovrsinaM2;
  }

  set zagrevanaPovrsinaM2(value: number) {
    this.updateData(() => {
      this.data.zagrevanaPovrsinaM2 = value;
    });
  }

  get iznosUmanjenjaSaPdv(): number {
    return this.data.iznosUmanjenjaSaPdv;
  }

  set iznosUmanjenjaSaPdv(value: number) {
    this.updateData(() => {
      this.data.iznosUmanjenjaSaPdv = value;
    });
  }

  get predmetId(): number {
    return this.data.predmetId;
  }

  set predmetId(value: number) {
    this.updateData(() => {
      this.data.predmetId = value;
    });
  }
}
