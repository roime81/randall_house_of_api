import { FieldValue } from "firebase/firestore";

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: 'admin' | 'user';
  photoURL?: string;
  createdAt?: FieldValue;
}

export interface Tenant {
  id: string;
  // userId is no longer required as we have disabled auth
  userId?: string; 
  name: string;
  description: string;
  logoUrl: string;
  createdAt: string;
  apiServers: ApiServer[];
  apiGateway: {
    endpoint: string;
    routes: ApiRoute[];
  };
  eventStreams: EventStream[];
  upstreamApis: UpstreamApi[];
  dataStore: {
    sampleData: Record<string, any>;
    usage: string;
    activityLog: string;
  };
}

export type TenantSummary = Pick<
  Tenant,
  'id' | 'name' | 'description' | 'logoUrl'
>;

export interface ApiServer {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'deploying' | 'error';
  createdAt: string;
  region: string;
}

export interface ApiRoute {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  targetServer: string;
}

export interface EventStream {
  id: string;
  topic: string;
  status: 'active' | 'inactive';
}

export interface UpstreamApi {
  id: string;
  name: string;
  baseUrl: string;
  authenticated: boolean;
}
