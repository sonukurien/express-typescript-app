import baas from '@actian/baas';
import {host} from './args';

const TokenStorage: any = baas.intersection /* v3+ */ ? baas.intersection.TokenStorage : baas.util.TokenStorage;

let globalDb: any;
let emf: any;

const isInitialized = (): boolean => {
  return !!emf;
};

const initialize = (req: { body: any; token: string; userId?: string; roleIds?: string[] }): void => {
  emf = new baas.EntityManagerFactory({
    host: host,
    schema: req.body,
    tokenStorage: new TokenStorage()
  });

  globalDb = emf.createEntityManager();
  setUserData(globalDb, req);
};

const getGlobalDB = (): any => {
  return globalDb;
};

/**
 * Create an anonymous db that have node permission
 * @return {any}
 */
const createNodeDBForJob = (): any => {
  const db = emf.createEntityManager();
  db.token = globalDb.token;
  return db;
};

/**
 * Create a db for the logged-in user with additional node permission
 * @return {any}
 */
const createUserDBForRequest = (req: { token: string; userId?: string; roleIds?: string[] }): any => {
  const db = emf.createEntityManager();
  setUserData(db, req);
  return db;
};

const logError = (e: any): Promise<any> => {
  if (globalDb) {
    return globalDb.log.error(e && e.stack ? e.stack : e).catch(function(err: any) {
      console.error(err);
      throw err;
    });
  } else {
    console.error(e);
    return Promise.reject(e);
  }
};

const setUserData = (db: any, req: { token: string; userId?: string; roleIds?: string[] }): void => {
  db.token = req.token;
  if (req.userId) {
    db.me = db.getReference('User', req.userId);
    db.me.roles = !req.roleIds ? [] : req.roleIds.map(function(id: string) {
      return db.getReference('Role', id);
    });
  }
};

export { initialize, isInitialized, getGlobalDB, createUserDBForRequest, createNodeDBForJob, logError };