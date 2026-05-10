import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { routesMeta } from '../config/routesMeta';

export const useDynamicTitle = () => {
  const location = useLocation();

  useEffect(() => {
    const currentRouteMeta = routesMeta[location.pathname];
    document.title = currentRouteMeta?.title || 'Credify Bank';
  }, [location.pathname]);
};
