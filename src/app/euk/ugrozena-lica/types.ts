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

export interface UgrozenoLiceFormData {
  ime: string;
  prezime: string;
  jmbg: string;
  datumRodjenja: string;
  drzavaRodjenja: string;
  mestoRodjenja: string;
  opstinaRodjenja: string;
  predmetId: number;
}

export interface UgrozenoLiceResponse {
  content: UgrozenoLice[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
