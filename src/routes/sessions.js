import { Router } from 'express';
import User from '../daos/models/user.js';
import { hashPassword, comparePassword } from '../utils/auth.js';
import jwt from 'jsonwebtoken';
import passport from '../passport/jwt.js';
import UserDTO from '../dtos/UserDTO.js';
import { requestPasswordReset, resetPassword } from '../services/authService.js';

const router = Router();

// Registro
router.post('/register', async (req, res, next) => {
  try {
    const { first_name, last_name, email, age, password, role } = req.body;
    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ status: 'error', message: 'Faltan datos' });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ status: 'error', message: 'Email ya registrado' });
    }
    const user = await User.create({
      first_name,
      last_name,
      email,
      age,
      password: hashPassword(password),
      role
    });
    const u = user.toObject();
    delete u.password;
    res.status(201).json({ status: 'success', user: u });
  } catch (err) {
    next(err);
  }
});

// Login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !comparePassword(password, user.password)) {
      return res.status(401).json({ status: 'error', message: 'Credenciales inválidas' });
    }
    const payload = { id: user._id, email: user.email, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret_jwt_key', { expiresIn: '1h' });
    res.json({ status: 'success', token });
  } catch (err) {
    next(err);
  }
});

// Current - devuelve DTO sin datos sensibles
router.get('/current',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const dto = new UserDTO(req.user);
    res.json({ status: 'success', user: dto });
  }
);

// Password reset request
router.post('/request-reset', async (req, res, next) => {
  try {
    const { email } = req.body;
    const origin = req.get('origin') || `${req.protocol}://${req.get('host')}`;
    await requestPasswordReset(email, origin);
    // Siempre responder OK para evitar user enumeration
    res.json({ status: 'ok', message: 'If the user exists, an email was sent' });
  } catch (err) {
    next(err);
  }
});

// Reset with token
router.post('/reset/:token', async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    await resetPassword(token, password);
    res.json({ status: 'ok', message: 'Password updated' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
