import User from '../daos/models/user.js';

export default class UserRepository {
  async create(data) { return User.create(data); }
  async findById(id) { return User.findById(id).populate('cart').lean(); }
  async findByEmail(email) { return User.findOne({ email }).populate('cart').lean(); }
  async updateById(id, update) { return User.findByIdAndUpdate(id, update, { new: true }).lean(); }
  async setResetToken(email, token, expires) {
    return User.findOneAndUpdate({ email }, { resetPasswordToken: token, resetPasswordExpires: expires }, { new: true }).lean();
  }
  async findByResetToken(token) {
    return User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: new Date() } }).lean();
  }
}
