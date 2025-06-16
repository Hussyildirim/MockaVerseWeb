import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Bileşenleri içe aktar
import Navigation from './components/layout/Navigation';
import ScenarioList from './components/scenarios/ScenarioList';
import ScenarioForm from './components/scenarios/ScenarioForm';
import CustomerList from './components/customers/CustomerList';
import CustomerForm from './components/customers/CustomerForm';
import NotFound from './components/common/NotFound';

const App = () => {
  return (
    <>
      <Navigation />
      <div className="container">
        <Routes>
          <Route path="/" element={<Navigate to="/scenarios" />} />
          <Route path="/scenarios" element={<ScenarioList />} />
          <Route path="/scenarios/new" element={<ScenarioForm />} />
          <Route path="/scenarios/edit/:id" element={<ScenarioForm />} />
          <Route path="/customers" element={<CustomerList />} />
          <Route path="/customers/new" element={<CustomerForm />} />
          <Route path="/customers/edit/:id" element={<CustomerForm />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <ToastContainer position="bottom-right" />
    </>
  );
};

export default App; 