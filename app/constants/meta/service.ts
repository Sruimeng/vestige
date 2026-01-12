import { isDEV } from './env';

const DevApiURL = 'http://localhost:3001/api';
const DevBaseUrl = 'http://localhost:3000';

export const ApiURL = import.meta.env.VITE_API_BASE_URL || (isDEV ? DevApiURL : '');
export const BaseUrl = import.meta.env.VITE_BASE_URL || (isDEV ? DevBaseUrl : '');
