import axios from 'axios';

// Base URL for the API - adjust this to match your .NET API endpoint
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5285';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export type Employee = {
  id?: number;
  employeeNumber?: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string; 
  dailyRate: number;
  workingDayNumbers: number[]; 
};

export type CreateEmployeeRequest = {
  firstName: string;
  lastName: string;
  dateOfBirth: string; 
  dailyRate: number;
  workingDayNumbers: number[];
};

export type UpdateEmployeeRequest = {
  firstName: string;
  lastName: string;
  dateOfBirth: string; 
  dailyRate: number;
  workingDayNumbers: number[];
};

export type ComputePayRequest = {
  startDate: string;
  endDate: string; 
};

export type ComputePayResponse = {
  takeHomePay: number;
};

export const employeeApi = {

  getAll: async (): Promise<Employee[]> => {
    const response = await api.get<Employee[]>('/api/employees');
    return response.data;
  },

  getById: async (id: number): Promise<Employee> => {
    const response = await api.get<Employee>(`/api/employees/${id}`);
    return response.data;
  },

  create: async (employee: CreateEmployeeRequest): Promise<Employee> => {
    const response = await api.post<Employee>('/api/employees', employee);
    return response.data;
  },

  update: async (id: number, employee: UpdateEmployeeRequest): Promise<Employee> => {
    const response = await api.put<Employee>(`/api/employees/${id}`, employee);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/employees/${id}`);
  },

  computePay: async (id: number, request: ComputePayRequest): Promise<ComputePayResponse> => {
    const response = await api.post<ComputePayResponse>(`/api/employees/${id}/compute-pay`, request);
    return response.data;
  },
};

export default api;
