import { ExampleEntity } from '../../domain/entities/example.js';
import mongoose from 'mongoose';

// Schema do Mongoose
const ExampleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Criar o modelo
export const ExampleModel = mongoose.model('Example', ExampleSchema);

// Implementação do repositório conforme interface definida na camada de aplicação
export class ExampleRepositoryImpl {
  async findAll() {
    const examples = await ExampleModel.find({});
    return examples.map(doc => this.mapToEntity(doc));
  }
  
  async findById(id) {
    const example = await ExampleModel.findById(id);
    return example ? this.mapToEntity(example) : null;
  }
  
  async save(exampleEntity) {
    if (exampleEntity.id) {
      const updated = await ExampleModel.findByIdAndUpdate(
        exampleEntity.id,
        this.mapToModel(exampleEntity),
        { new: true }
      );
      return this.mapToEntity(updated);
    } else {
      const created = await ExampleModel.create(this.mapToModel(exampleEntity));
      return this.mapToEntity(created);
    }
  }
  
  async delete(id) {
    await ExampleModel.findByIdAndDelete(id);
  }
  
  // Mapeia documento do Mongoose para entidade de domínio
  mapToEntity(doc) {
    return new ExampleEntity({
      id: doc._id.toString(),
      name: doc.name,
      description: doc.description,
      isActive: doc.isActive,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    });
  }
  
  // Mapeia entidade de domínio para documento Mongoose
  mapToModel(entity) {
    const model = {
      name: entity.name,
      description: entity.description,
      isActive: entity.isActive,
      updatedAt: new Date()
    };
    
    return model;
  }
}