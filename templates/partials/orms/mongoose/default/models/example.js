import mongoose from 'mongoose';

const exampleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Por favor adicione um título'],
    trim: true,
    maxlength: [50, 'Título não pode ter mais de 50 caracteres']
  },
  description: {
    type: String,
    required: false,
    maxlength: [500, 'Descrição não pode ter mais de 500 caracteres']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware de exemplo para log
exampleSchema.pre('save', function(next) {
  console.log(`Salvando exemplo: ${this.title}`);
  next();
});

// Método estático de exemplo
exampleSchema.statics.findByTitle = function(title) {
  return this.find({ title: new RegExp(title, 'i') });
};

// Método de instância de exemplo
exampleSchema.methods.getInfo = function() {
  return `${this.title} - Criado em: ${this.createdAt.toDateString()}`;
};

// Exportar o modelo
const Example = mongoose.model('Example', exampleSchema);
export default Example;