import type { Config } from '@react-router/dev/config';

const config: Config = {
  ssr: false,
  buildDirectory: './dist',
  routeDiscovery: { mode: 'initial' },
};

export default config;
