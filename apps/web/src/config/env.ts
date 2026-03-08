export const env = {
  // Boş/undefined ise aynı origin (Vite proxy ile API'ye gider; cookie çalışır)
  apiUrl: import.meta.env['VITE_API_URL'] || (typeof window !== 'undefined' ? window.location.origin : ''),
  embedUrl: import.meta.env['VITE_EMBED_URL'],
  cdnUrl: import.meta.env['VITE_CDN_URL'],
  devtools: {
    reactQuery: import.meta.env['VITE_DEVTOOLS_REACT_QUERY'] === 'true',
    tanstackRouter: import.meta.env['VITE_DEVTOOLS_TANSTACK_ROUTER'] === 'true',
  },
};
