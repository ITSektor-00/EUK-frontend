export interface UgrozenoLiceT1 {
  ugrozenoLiceId?: number;
  redniBroj: string;
  ime: string;
  prezime: string;
  jmbg: string;
  pttBroj?: string;
  gradOpstina?: string;
  mesto?: string;
  ulicaIBroj?: string;
  brojClanovaDomacinstva?: number;
  osnovSticanjaStatusa?: string; // MP, NSP, DD, UDTNP
  edBrojBrojMernogUredjaja?: string;
  potrosnjaKwh?: number;
  zagrevanaPovrsinaM2?: number;
  potrosnjaIPovrsinaCombined?: string;  // 🆕 NOVA KOLONA - kombinuje potrosnjaKwh i zagrevanaPovrsinaM2
  iznosUmanjenjaSaPdv?: number;
  brojRacuna?: string;
  datumIzdavanjaRacuna?: string;
  datumTrajanjaPrava?: string;   // 🆕 NOVO POLJE - LocalDate
  createdAt?: string;
  updatedAt?: string;
  [key: string]: string | number | undefined;
}

export interface UgrozenoLiceFormData {
  redniBroj: string;
  ime: string;
  prezime: string;
  jmbg: string;
  pttBroj?: string;
  gradOpstina?: string;
  mesto?: string;
  ulicaIBroj?: string;
  brojClanovaDomacinstva?: number;
  osnovSticanjaStatusa?: string;
  edBrojBrojMernogUredjaja?: string;
  potrosnjaKwh?: number;
  zagrevanaPovrsinaM2?: number;
  potrosnjaIPovrsinaCombined?: string;  // 🆕 NOVA KOLONA - kombinuje potrosnjaKwh i zagrevanaPovrsinaM2
  iznosUmanjenjaSaPdv?: number;
  brojRacuna?: string;
  datumIzdavanjaRacuna?: string;
  datumTrajanjaPrava?: string;   // 🆕 NOVO POLJE - LocalDate
  [key: string]: string | number | undefined;
}

// Zadržavamo staru strukturu za kompatibilnost tokom migracije
export interface UgrozenoLice {
  ugrozenoLiceId: number;
  ime: string;
  prezime: string;
  jmbg: string;
  datumRodjenja: string;
  drzavaRodjenja: string;
  mestoRodjenja: string;
  opstinaRodjenja: string;
  predmetId: number;
  [key: string]: string | number;
}

export interface UgrozenoLiceResponse {
  content: UgrozenoLiceT1[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// Statistike interface
export interface UgrozenoLiceStatistics {
  totalRecords: number;
  sumIznosUmanjenjaSaPdv: number;
  avgPotrosnjaKwh: number;
  avgZagrevanaPovrsinaM2: number;
}

// Filteri interface
export interface UgrozenoLiceFilters {
  jmbg?: string;
  redniBroj?: string;
  ime?: string;
  prezime?: string;
  gradOpstina?: string;
  mesto?: string;
  pttBroj?: string;
  osnovStatusa?: string;
  edBroj?: string;
  brojRacuna?: string;
  datumOd?: string; // YYYY-MM-DD
  datumDo?: string; // YYYY-MM-DD
  iznosOd?: number;
  iznosDo?: number;
  datumTrajanjaPravaOd?: string;  // 🆕 NOVO - datum trajanja prava od
  datumTrajanjaPravaDo?: string;  // 🆕 NOVO - datum trajanja prava do
}
