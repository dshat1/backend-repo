import crypto from 'crypto';
import bcrypt from 'bcrypt';
import UserRepoClass from '../repositories/UserRepository.js';
import { sendMail } from './mailer.js';
const userRepo = new UserRepoClass();
const TOKEN_EXP_MS = 60 * 60 * 1000; // 1 hour

export async function requestPasswordReset(email, origin) {
  const user = await userRepo.findByEmail(email);
  if (!user) return; // do not reveal
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + TOKEN_EXP_MS);
  await userRepo.setResetToken(email, token, expires);
  const link = `${origin.replace(/\/$/, '')}/auth/reset/${token}`;
  const html = `<p>Hola ${user.first_name || ''},</p>
  <p>Para restablecer tu contraseña hacé click:</p>
  <p><a href="${link}">Restablecer contraseña</a></p>
  <p>El enlace expira en 1 hora.</p>`;
  await sendMail({ to: user.email, subject: 'Restablecer contraseña', html });
}

export async function resetPassword(token, newPassword) {
  const user = await userRepo.findByResetToken(token);
  if (!user) throw new Error('Token inválido o expirado');
  const same = await bcrypt.compare(newPassword, user.password);
  if (same) throw new Error('La nueva contraseña no puede ser igual a la anterior');
  const hashed = await bcrypt.hash(newPassword, 10);
  await userRepo.updateById(user._id, { password: hashed, resetPasswordToken: null, resetPasswordExpires: null });
  await sendMail({ to: user.email, subject: 'Contraseña actualizada', html: '<p>Tu contraseña fue cambiada correctamente.</p>' });
}
