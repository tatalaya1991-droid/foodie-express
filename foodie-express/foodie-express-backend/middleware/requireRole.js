module.exports = function requireRole(...allowed) {
  return (req, res, next) => {
    const role = req.user?.role || 'customer';
    if (!allowed.includes(role)) {
      return res.status(403).json({ message: 'Forbidden (insufficient role)' });
    }
    next();
  };
};
