import { BaseViewModel } from './BaseViewModel';
import { IDatabaseService } from '../services/databaseService';

export interface UgrozenoLiceT2Data {
  ugrozenoLiceId: number;
  redniBroj: number;
  ime: string;
  prezime: string;
  jmbg: string;
  adresa: string;
  telefon: string;
  email: string;
  datumRodjenja: string;
  pol: string;
  zanimanje: string;
  prihod: number;
  status: string;
}

export class UgrozenoLiceT2ViewModel extends BaseViewModel<UgrozenoLiceT2Data> {
  constructor(db: IDatabaseService, data: UgrozenoLiceT2Data) {
    super(db, data);
  }

  protected async performUpdate(): Promise<void> {
    await this.db.updateUgrozenoLiceT2(this.data);
  }

  // Getters i setters sa automatskim ažuriranjem
  get ugrozenoLiceId(): number {
    return this.data.ugrozenoLiceId;
  }

  get redniBroj(): number {
    return this.data.redniBroj;
  }

  set redniBroj(value: number) {
    this.updateData(() => {
      this.data.redniBroj = value;
    });
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

  get adresa(): string {
    return this.data.adresa;
  }

  set adresa(value: string) {
    this.updateData(() => {
      this.data.adresa = value;
    });
  }

  get telefon(): string {
    return this.data.telefon;
  }

  set telefon(value: string) {
    this.updateData(() => {
      this.data.telefon = value;
    });
  }

  get email(): string {
    return this.data.email;
  }

  set email(value: string) {
    this.updateData(() => {
      this.data.email = value;
    });
  }

  get datumRodjenja(): string {
    return this.data.datumRodjenja;
  }

  set datumRodjenja(value: string) {
    this.updateData(() => {
      this.data.datumRodjenja = value;
    });
  }

  get pol(): string {
    return this.data.pol;
  }

  set pol(value: string) {
    this.updateData(() => {
      this.data.pol = value;
    });
  }

  get zanimanje(): string {
    return this.data.zanimanje;
  }

  set zanimanje(value: string) {
    this.updateData(() => {
      this.data.zanimanje = value;
    });
  }

  get prihod(): number {
    return this.data.prihod;
  }

  set prihod(value: number) {
    this.updateData(() => {
      this.data.prihod = value;
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
}
