import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fastify_app', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log(`MongoDB conectado: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Erro: ${error.message}`);
    throw error;
  }
};

// Desconectar do banco de dados
export const disconnectDB = async () => {
  await mongoose.disconnect();
  console.log('Desconectado do MongoDB');
};

// Exportar instância do mongoose para uso em modelos
export default mongoose;