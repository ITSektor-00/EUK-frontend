-- SQL SKRIPTA ZA NOVI SISTEM NIVOA PRISTUPA
-- Ova skripta kreira tabele i podatke potrebne za novi sistem nivoa pristupa

-- 1. Kreiranje tabele rute (ako ne postoji)
CREATE TABLE IF NOT EXISTS rute (
    id SERIAL PRIMARY KEY,
    ruta VARCHAR(255) NOT NULL UNIQUE,
    naziv VARCHAR(255) NOT NULL,
    opis TEXT,
    sekcija VARCHAR(100),
    nivo_min INTEGER NOT NULL DEFAULT 1,
    nivo_max INTEGER NOT NULL DEFAULT 5,
    aktivna BOOLEAN DEFAULT true,
    datum_kreiranja TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Kreiranje tabele user_routes (ako ne postoji)
CREATE TABLE IF NOT EXISTS user_routes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    route_id INTEGER NOT NULL,
    nivo_dozvole INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (route_id) REFERENCES rute(id) ON DELETE CASCADE,
    UNIQUE(user_id, route_id)
);

-- 3. Dodavanje kolone nivo_pristupa u tabelu users (ako ne postoji)
ALTER TABLE users ADD COLUMN IF NOT EXISTS nivo_pristupa INTEGER DEFAULT 1;

-- 4. Popunjavanje tabele rute sa osnovnim rutama
INSERT INTO rute (ruta, naziv, opis, sekcija, nivo_min, nivo_max) VALUES
('euk/kategorije', 'Kategorije', 'Upravljanje kategorijama predmeta', 'EUK', 1, 5),
('euk/predmeti', 'Predmeti', 'Upravljanje predmetima', 'EUK', 2, 5),
('euk/ugrozena-lica', 'Ugrožena lica', 'Upravljanje ugroženim licima', 'EUK', 3, 5),
('euk/stampanje', 'Štampanje', 'Štampanje dokumenata', 'EUK', 4, 5),
('reports', 'Izveštaji', 'Generisanje izveštaja', 'REPORTS', 4, 5),
('analytics', 'Analitika', 'Analitika sistema', 'ANALYTICS', 4, 5),
('settings', 'Podešavanja', 'Korisnička podešavanja', 'SETTINGS', 1, 5),
('profile', 'Profil', 'Korisnički profil', 'PROFILE', 1, 5)
ON CONFLICT (ruta) DO NOTHING;

-- 5. Ažuriranje postojećih korisnika sa nivoima pristupa
UPDATE users SET nivo_pristupa = 5 WHERE role = 'admin' OR role = 'ADMIN';
UPDATE users SET nivo_pristupa = 3 WHERE role = 'obradjivaci predmeta';
UPDATE users SET nivo_pristupa = 2 WHERE role = 'potpisnik';

-- 6. Dodavanje test user_routes (opciono)
INSERT INTO user_routes (user_id, route_id, nivo_dozvole) VALUES
(2, 1, 3), -- Marko - Kategorije
(2, 2, 3), -- Marko - Predmeti
(3, 3, 2)  -- Ana - Ugrožena lica
ON CONFLICT (user_id, route_id) DO NOTHING;

-- 7. Kreiranje indeksa za bolje performanse
CREATE INDEX IF NOT EXISTS idx_user_routes_user_id ON user_routes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_routes_route_id ON user_routes(route_id);
CREATE INDEX IF NOT EXISTS idx_rute_aktivna ON rute(aktivna);
CREATE INDEX IF NOT EXISTS idx_users_nivo_pristupa ON users(nivo_pristupa);

-- 8. Prikaz rezultata
SELECT 'Rute tabele:' as info;
SELECT COUNT(*) as broj_ruta FROM rute;

SELECT 'User routes tabele:' as info;
SELECT COUNT(*) as broj_user_routes FROM user_routes;

SELECT 'Korisnici sa nivoima:' as info;
SELECT id, username, role, nivo_pristupa FROM users ORDER BY nivo_pristupa DESC;
