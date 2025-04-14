// templates/mvc/src/controllers/exampleController.js
import { exampleService } from '../services/exampleService.js';

export const exampleController = {
  async getAll(request, reply) {
    try {
      const items = await exampleService.findAll();
      return reply.code(200).send(items);
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Erro interno do servidor' });
    }
  },
  
  async getById(request, reply) {
    try {
      const { id } = request.params;
      const item = await exampleService.findById(id);
      
      if (!item) {
        return reply.code(404).send({ error: 'Item não encontrado' });
      }
      
      return reply.code(200).send(item);
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Erro interno do servidor' });
    }
  },
  
  async create(request, reply) {
    try {
      const newItem = await exampleService.create(request.body);
      return reply.code(201).send(newItem);
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Erro interno do servidor' });
    }
  }
};