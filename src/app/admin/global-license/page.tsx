'use client';

import React from 'react';
import GlobalLicenseAdmin from '../../../components/GlobalLicenseAdmin';

const GlobalLicenseAdminPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Upravljanje globalnom licencom
          </h1>
          <p className="text-gray-600">
            Ovdje možete upravljati globalnom licencom sistema, kreirati nove licence, produžiti postojeće i deaktivirati istekle.
          </p>
        </div>

        <GlobalLicenseAdmin />
      </div>
    </div>
  );
};

export default GlobalLicenseAdminPage;
