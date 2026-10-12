import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { NewDiagnosis } from './pages/NewDiagnosis.jsx';
import { DiagnosisResults } from './pages/DiagnosisResults.jsx';
import { History } from './pages/History.jsx';
import { ScenariosPage } from './pages/ScenariosPage.jsx';
import { About } from './pages/About.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="diagnose" element={<NewDiagnosis />} />
          <Route path="results" element={<DiagnosisResults />} />
          <Route path="history" element={<History />} />
          <Route path="scenarios" element={<ScenariosPage />} />
          <Route path="about" element={<About />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
