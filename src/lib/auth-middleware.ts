import { NextRequest } from 'next/server';
import { auth } from './firebase-admin';
import { logger } from './logger';

export interface AuthenticatedRequest extends NextRequest {
  userId?: string;
  userEmail?: string;
}

export async function verifyAuth(
  request: NextRequest
): Promise<{ authenticated: boolean; userId?: string; userEmail?: string; error?: string }> {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { authenticated: false, error: 'No authentication token provided' };
    }

    const token = authHeader.split('Bearer ')[1];
    
    const decodedToken = await auth.verifyIdToken(token);
    
    logger.debug('Token verified', { uid: decodedToken.uid });
    
    return {
      authenticated: true,
      userId: decodedToken.uid,
      userEmail: decodedToken.email,
    };
  } catch (error) {
    logger.error('Auth verification failed', error);
    return { authenticated: false, error: 'Invalid or expired token' };
  }
}
