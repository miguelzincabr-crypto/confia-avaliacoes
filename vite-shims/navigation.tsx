import { useNavigate, useParams as useRouteParams } from 'react-router-dom';

/** Shim de compatibilidade para next/navigation (useParams/useRouter). */
export function useParams<T extends Record<string, string>>(): T {
  return useRouteParams() as T;
}

export function useRouter() {
  const navigate = useNavigate();
  return {
    push: (href: string) => navigate(href),
    replace: (href: string) => navigate(href, { replace: true }),
    back: () => navigate(-1),
    refresh: () => {
      /* No SPA não há revalidação de servidor; o estado já é reativo. */
    },
  };
}
