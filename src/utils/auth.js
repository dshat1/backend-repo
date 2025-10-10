import bcrypt from 'bcrypt';

export const hashPassword = (plain) => bcrypt.hashSync(plain, 10);

export const comparePassword = (plain, hash) => bcrypt.compareSync(plain, hash);
