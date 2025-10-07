// Word Template Generation Types

export interface WordTemplateGenerationRequest {
    liceId: number;
    liceTip: 't1' | 't2';
    kategorijaId: number;
    obrasciVrsteId: number;
    organizacionaStrukturaId: number;
    predmetId: number;
    manualData: ManualData;
}

export interface ManualData {
    ZAGLAVLJE: string;
    OBRAZLOZENJE: string;
    DODATNI_PODACI?: string;
}

export interface WordTemplateGenerationResponse {
    predmetId: number;
    templateFilePath: string;
    templateStatus: 'generated' | 'error';
    templateGeneratedAt: string;
    message: string;
    success: boolean;
}

export interface WordTemplateStep {
    title: string;
    description: string;
    completed: boolean;
    active: boolean;
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

export interface PredmetSelection {
    predmetId: number;
    predmetNaziv: string;
}

export interface WordTemplateFormData {
    liceSelection: LiceSelection | null;
    kategorijaSelection: KategorijaSelection | null;
    obrasciVrsteSelection: ObrasciVrsteSelection | null;
    organizacionaStrukturaSelection: OrganizacionaStrukturaSelection | null;
    predmetSelection: PredmetSelection | null;
    manualData: ManualData;
}

// Existing types (reused from template.ts)
export interface Lice {
    id: number;
    ime: string;
    prezime: string;
    jmbg?: string;
}

export interface Kategorija {
    id: number;
    naziv: string;
    opis?: string;
}

export interface ObrasciVrste {
    id: number;
    naziv: string;
    opis?: string;
}

export interface OrganizacionaStruktura {
    id: number;
    naziv: string;
    opis?: string;
}

export interface Predmet {
    id: number;
    naziv: string;
    opis?: string;
}
