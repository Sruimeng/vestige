import { useTranslation } from 'react-i18next';
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router';
import { Theme, ThemeProvider, useTheme } from 'remix-themes';
import 'virtual:uno.css';
import { DefaultErrorBoundary } from './components';
import './root.css';

export const links = () => {
  return [
    {
      rel: 'icon',
      type: 'image/x-icon',
      href: '/favicon.ico',
    },
  ];
};

const App: React.FC = () => {
  const { i18n } = useTranslation();
  const [theme] = useTheme();

  return (
    <html lang={i18n.language} dir={i18n.dir(i18n.language)} data-theme={theme}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <Meta />
        <Links />
      </head>
      <body className="select-none">
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
};

const getInitialTheme = (): Theme => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('theme') as Theme | null;
    if (stored === Theme.DARK || stored === Theme.LIGHT) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? Theme.DARK : Theme.LIGHT;
  }
  return Theme.DARK;
};

const AppWithProviders = () => {
  return (
    <ThemeProvider specifiedTheme={getInitialTheme()} themeAction="">
      <App />
    </ThemeProvider>
  );
};

export const ErrorBoundary: React.FC = () => {
  try {
    return (
      <ThemeProvider specifiedTheme={Theme.DARK} themeAction="">
        <DefaultErrorBoundary />
      </ThemeProvider>
    );
  } catch {
    return null;
  }
};

export default AppWithProviders;
