import { Tenant } from './types';
import { placeholderImages } from './placeholder-images';

export const initialTenants: Tenant[] = [
  {
    id: 'innovate-corp',
    name: 'Innovate Corp',
    description: 'A cutting-edge technology firm specializing in AI-driven solutions for enterprise customers.',
    logoUrl: placeholderImages.find(img => img.id === 'logo1')?.imageUrl || '',
    createdAt: '2023-01-15T09:30:00Z',
    mcpServers: [
      { id: 'mcps-1', name: 'Primary API Server', status: 'running', createdAt: '2023-01-20T10:00:00Z', region: 'us-central1' },
      { id: 'mcps-2', name: 'Analytics Worker', status: 'running', createdAt: '2023-02-10T14:00:00Z', region: 'us-central1' },
      { id: 'mcps-3', name: 'Staging Environment', status: 'stopped', createdAt: '2023-03-01T11:00:00Z', region: 'us-east1' },
    ],
    apiGateway: {
      endpoint: 'https://innovate-corp.tenantflow.dev/api',
      routes: [
        { path: '/users', method: 'GET', targetServer: 'mcps-1' },
        { path: '/data', method: 'POST', targetServer: 'mcps-2' },
      ],
    },
    eventStreams: [
      { id: 'ev-1', topic: 'user-signups', status: 'active' },
      { id: 'ev-2', topic: 'data-processing-jobs', status: 'active' },
    ],
    upstreamApis: [
      { id: 'upa-1', name: 'Stripe Payments', baseUrl: 'https://api.stripe.com', authenticated: true },
    ],
    dataStore: {
      sampleData: { "users": [{ "id": 1, "name": "John Doe" }], "projects": 12 },
      usage: '1.2 GB of 10 GB used.',
      activityLog: 'User John Doe accessed project data. New user registered.',
    },
  },
  {
    id: 'health-first',
    name: 'HealthFirst',
    description: 'A digital health platform providing telehealth services and patient data management.',
    logoUrl: placeholderImages.find(img => img.id === 'logo2')?.imageUrl || '',
    createdAt: '2023-04-22T14:00:00Z',
    mcpServers: [
      { id: 'mcps-4', name: 'Patient Portal API', status: 'running', createdAt: '2023-04-25T16:00:00Z', region: 'europe-west1' },
      { id: 'mcps-5', name: 'Video Conferencing Service', status: 'deploying', createdAt: '2023-05-05T18:00:00Z', region: 'europe-west1' },
    ],
    apiGateway: {
      endpoint: 'https://health-first.tenantflow.dev/api',
      routes: [
        { path: '/patients', method: 'GET', targetServer: 'mcps-4' },
        { path: '/appointments', method: 'POST', targetServer: 'mcps-4' },
      ],
    },
    eventStreams: [
      { id: 'ev-3', topic: 'appointment-bookings', status: 'active' },
    ],
    upstreamApis: [],
    dataStore: {
      sampleData: { "patients": [{ "id": "p001", "name": "Jane Smith" }], "appointments": 250 },
      usage: '5.7 GB of 25 GB used.',
      activityLog: 'New appointment booked for Jane Smith. Patient record updated.',
    },
  },
];
