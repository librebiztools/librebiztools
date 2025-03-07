import { unstable_createContext } from 'react-router';
import type { Context } from './.server/context';

export const appContext = unstable_createContext<Context>();
