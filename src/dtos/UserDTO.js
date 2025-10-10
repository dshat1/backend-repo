export default class UserDTO {
  constructor(user) {
    if (!user) return {};
    this.id = user._id ? String(user._id) : user.id;
    this.first_name = user.first_name || user.name || null;
    this.last_name = user.last_name || null;
    this.email = user.email || null;
    this.role = user.role || 'user';
    this.cart = user.cart ? (user.cart._id ? String(user.cart._id || user.cart._id) : user.cart) : null;
    this.createdAt = user.createdAt || user.created_at || null;
  }
}
