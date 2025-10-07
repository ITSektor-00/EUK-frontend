// Template Generation System Types

export interface TemplateGenerationRequest {
    liceId: number;
    liceTip: 't1' | 't2';
    kategorijaId: number;
    obrasciVrsteId: number;
    organizacionaStrukturaId: number;
    predmetId: number;
}

export interface TemplateGenerationResponse {
    predmetId: number;
    templateFilePath: string;
    templateStatus: string;
    templateGeneratedAt: string;
    message: string;
    success: boolean;
}

export interface ObrasciVrste {
    id: number;
    naziv: string;
    opis: string;
    createdAt: string;
    updatedAt: string;
}

export interface OrganizacionaStruktura {
    id: number;
    naziv: string;
    opis: string;
    createdAt: string;
    updatedAt: string;
}

export interface LiceSelection {
    liceId: number;
    liceTip: 't1' | 't2';
    liceNaziv: string;
}

export interface KategorijaSelection {
    kategorijaId: number;
    kategorijaNaziv: string;
}

export interface ObrasciVrsteSelection {
    obrasciVrsteId: number;
    obrasciVrsteNaziv: string;
}

export interface OrganizacionaStrukturaSelection {
    organizacionaStrukturaId: number;
    organizacionaStrukturaNaziv: string;
}

export interface TemplateStep {
    title: string;
    description: string;
    completed: boolean;
    active: boolean;
}

export interface TemplateFormData {
    liceSelection: LiceSelection | null;
    kategorijaSelection: KategorijaSelection | null;
    obrasciVrsteSelection: ObrasciVrsteSelection | null;
    organizacionaStrukturaSelection: OrganizacionaStrukturaSelection | null;
    predmetId: number | null;
}

export interface Lice {
    id: number;
    ime: string;
    prezime: string;
    jmbg?: string;
    tip: 't1' | 't2';
}

export interface Kategorija {
    id: number;
    naziv: string;
    opis?: string;
}
