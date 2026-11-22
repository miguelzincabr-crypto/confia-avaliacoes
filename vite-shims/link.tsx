import type { ComponentProps } from 'react';
import { Link as RouterLink } from 'react-router-dom';

type Props = Omit<ComponentProps<typeof RouterLink>, 'to'> & { href: string };

/** Shim de compatibilidade: permite que os componentes compartilhados
 * continuem usando a API do next/link também na build Vite. */
export default function Link({ href, ...rest }: Props) {
  return <RouterLink to={href} {...rest} />;
}
