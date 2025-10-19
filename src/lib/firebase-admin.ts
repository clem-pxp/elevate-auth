import admin from 'firebase-admin';
import { env } from './env';

let adminApp: admin.app.App;
let adminAuth: admin.auth.Auth;

function initializeAdminApp() {
  if (admin.apps.length === 0) {
    const serviceAccount = {
      projectId: env.firebase.projectId,
      clientEmail: env.firebase.clientEmail,
      privateKey: env.firebase.privateKey,
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
