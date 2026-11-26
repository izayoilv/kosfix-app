import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { Services } from '../services/types';

const ServicesContext = createContext<Services | null>(null);

export function ServicesProvider({
  services,
  children,
}: {
  services: Services;
  children: ReactNode;
}) {
  return <ServicesContext.Provider value={services}>{children}</ServicesContext.Provider>;
}

export function useServices(): Services {
  const services = useContext(ServicesContext);

  if (services === null) {
    throw new Error('useServices must be used inside ServicesProvider');
  }

  return services;
}
