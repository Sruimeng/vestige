import { isDEV } from './env';

const DevApiURL = 'http://localhost:3001/api';
const DevBaseUrl = 'http://localhost:3000';

const ProdApiURL = 'https://api.sruim.xin';
const ProdBaseUrl = 'https://vestige.sruim.xin';

export const ApiURL = isDEV ? DevApiURL : ProdApiURL;
export const BaseUrl = isDEV ? DevBaseUrl : ProdBaseUrl;
