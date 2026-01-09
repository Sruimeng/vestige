import { I18nConfig, resources } from '@/locales';
import i18next from '@/locales/lib/i18next';
import { I18nextProvider, initReactI18next } from '@/locales/lib/react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { startTransition, StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { HydratedRouter } from 'react-router/dom';

async function hydrate() {
  await i18next
    .use(initReactI18next)
    .use(LanguageDetector)
    .init({
      ...I18nConfig,
      resources,
      lng: localStorage.getItem('i18nextLng') || 'zh', // 默认中文
      detection: {
        order: ['localStorage', 'htmlTag', 'navigator'],
        caches: ['localStorage'],
      },
    });

  startTransition(() => {
    hydrateRoot(
      document,
      <I18nextProvider i18n={i18next}>
        <StrictMode>
          <HydratedRouter />
        </StrictMode>
      </I18nextProvider>,
    );
  });
}

if (window.requestIdleCallback) {
  window.requestIdleCallback(hydrate);
} else {
  // Safari doesn't support requestIdleCallback
  // https://caniuse.com/requestidlecallback
  window.setTimeout(hydrate, 1);
}
