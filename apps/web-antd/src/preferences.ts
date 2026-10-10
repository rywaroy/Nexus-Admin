import { defineOverridesPreferences } from '@vben/preferences';

export const overridesPreferences = defineOverridesPreferences({
  app: {
    accessMode: 'backend',
    name: import.meta.env.VITE_APP_TITLE,
  },
  copyright: {
    companyName: 'Nexus',
    companySiteLink: 'https://www.nexus.com',
    date: String(new Date().getFullYear()),
  },
  logo: { source: '/logo.png' },
});
