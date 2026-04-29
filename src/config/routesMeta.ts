const APP_NAME = 'Credify Bank';

export interface RouteMeta {
  title: string;
}

const createTitle = (page: string) => `${APP_NAME} | ${page}`;

export const routesMeta: Record<string, RouteMeta> = {
  '/': {
    title: APP_NAME,
  },
  '/login': {
    title: createTitle('Login'),
  },
  '/register': {
    title: createTitle('Create Account'),
  },
};