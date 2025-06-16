import axios from 'axios';

const BASE_URL = '/api';

// Senaryo API İstekleri
export const getScenariosApi = async () => {
  const response = await axios.get(`${BASE_URL}/scenarios`);
  return response.data;
};

export const getScenarioByIdApi = async (id) => {
  const response = await axios.get(`${BASE_URL}/scenarios/${id}`);
  return response.data;
};

export const createScenarioApi = async (scenarioData) => {
  const response = await axios.post(`${BASE_URL}/scenarios`, scenarioData);
  return response.data;
};

export const updateScenarioApi = async (id, scenarioData) => {
  const response = await axios.put(`${BASE_URL}/scenarios/${id}`, scenarioData);
  return response.data;
};

export const deleteScenarioApi = async (id) => {
  const response = await axios.delete(`${BASE_URL}/scenarios/${id}`);
  return response.data;
};

// Müşteri API İstekleri
export const getCustomersApi = async () => {
  const response = await axios.get(`${BASE_URL}/customers`);
  return response.data;
};

export const getCustomerByIdApi = async (id) => {
  const response = await axios.get(`${BASE_URL}/customers/${id}`);
  return response.data;
};

export const createCustomerApi = async (customerData) => {
  const response = await axios.post(`${BASE_URL}/customers`, customerData);
  return response.data;
};

export const updateCustomerApi = async (id, customerData) => {
  const response = await axios.put(`${BASE_URL}/customers/${id}`, customerData);
  return response.data;
};

export const deleteCustomerApi = async (id) => {
  const response = await axios.delete(`${BASE_URL}/customers/${id}`);
  return response.data;
}; 