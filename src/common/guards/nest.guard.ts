import * as guard from 'guardian-of-nest';

export async function applyGuard() {
    const isValid = guard.validateSecretKey(process.env.GUARDIAN_SECRET_KEY);
    const token = await guard.getToken(isValid);
    const decoded = guard.decodedToken(token);
    guard.applyGuard(decoded);
}
