import mongoose from 'mongoose';
import { promises as dns } from 'dns';

const MAX_RETRIES = parseInt(process.env.MONGO_CONNECT_RETRIES || '5', 10);
const RETRY_DELAY = parseInt(process.env.MONGO_CONNECT_RETRY_DELAY_MS || '5000', 10);

const extractSrvHost = (uri) => {
  try {
    // matches mongodb+srv://[user:pass@]host[/...]
    const m = uri.match(/^mongodb\+srv:\/\/(?:[^@]+@)?([^\/\?]+)/i);
    return m ? m[1] : null;
  } catch {
    return null;
  }
};

const checkSrv = async (uri) => {
  const host = extractSrvHost(uri);
  if (!host) return null;
  const srvName = `_mongodb._tcp.${host}`;
  try {
    const records = await dns.resolveSrv(srvName);
    return records;
  } catch (err) {
    throw new Error(`SRV lookup failed for ${srvName}: ${err.message}`);
  }
};

const connectDB = async (retries = 0) => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('❌ MONGO_URI no está configurada en el entorno');
    return;
  }

  try {
    await mongoose.connect(uri);
    console.log('✅ Conectado a MongoDB');
  } catch (error) {
    console.error(`❌ Error al conectar a MongoDB (intento ${retries + 1}):`, error.stack || error);

    // Attempt SRV resolution and log results to help diagnose ECONNREFUSED or DNS issues
    try {
      const srv = await checkSrv(uri);
      console.log('🔎 SRV records:', srv);
    } catch (srvErr) {
      console.error('🔎 SRV check error:', srvErr.message || srvErr);
    }

    if (retries < MAX_RETRIES) {
      console.log(`Reintentando en ${RETRY_DELAY}ms...`);
      setTimeout(() => connectDB(retries + 1), RETRY_DELAY);
    } else {
      console.error('❌ Se alcanzó el número máximo de reintentos. La base de datos no está conectada.');
    }
  }
};

export default connectDB;
