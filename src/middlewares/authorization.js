export default function allowedRoles(roles = []) {
  return (req, res, next) => {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    if (!Array.isArray(roles) || roles.length === 0) return next();
    if (roles.includes(user.role)) return next();
    return res.status(403).json({ error: 'Forbidden' });
  };
}
