import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import User from '../daos/models/user.js';

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || 'secret_jwt_key'
};

passport.use('jwt', new JwtStrategy(opts, async (payload, done) => {
  try {
    const user = await User.findById(payload.id).select('-password');
    if (user) return done(null, user);
    return done(null, false);
  } catch (err) {
    return done(err, false);
  }
}));

export default passport;
