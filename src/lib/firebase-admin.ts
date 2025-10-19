import admin from 'firebase-admin';
import { serverEnv } from './server-env';

let adminApp: admin.app.App;
let adminAuth: admin.auth.Auth;

function initializeAdminApp() {
  if (admin.apps.length === 0) {
    const serviceAccount = {
      projectId: serverEnv.firebase.projectId,
      clientEmail: serverEnv.firebase.clientEmail,
      privateKey: serverEnv.firebase.privateKey,
    };

    adminApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    });
  } else {
    adminApp = admin.apps[0]!;
  }

  adminAuth = admin.auth(adminApp);
  return { app: adminApp, auth: adminAuth };
}

const { app, auth } = initializeAdminApp();

export { app as adminApp, auth };
