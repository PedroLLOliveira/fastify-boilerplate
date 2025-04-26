import mongoose from 'mongoose';

export async function connectToDatabase() {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    return conn;
  } catch (error) {
    console.error(`Erro na conexão com MongoDB: ${error.message}`);
    throw error;
  }
}

export function disconnectFromDatabase() {
  return mongoose.disconnect();
}

// Registrar eventos de conexão
mongoose.connection.on('connected', () => {
  console.log(`Mongoose conectado a ${process.env.MONGODB_URI}`);
});

mongoose.connection.on('error', (err) => {
  console.error('Erro na conexão Mongoose:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose desconectado');
});

// Capturar sinais de terminação para fechar a conexão corretamente
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('Conexão Mongoose encerrada pela aplicação');
  process.exit(0);
});