export class ExampleEntity {
    constructor({ id, name, description, isActive, createdAt, updatedAt }) {
      this.id = id;
      this.name = name;
      this.description = description;
      this.isActive = isActive !== undefined ? isActive : true;
      this.createdAt = createdAt || new Date();
      this.updatedAt = updatedAt || new Date();
    }
    
    validate() {
      if (!this.name) {
        throw new Error('Nome é obrigatório');
      }
      
      return true;
    }
    
    activate() {
      this.isActive = true;
      this.updatedAt = new Date();
    }
    
    deactivate() {
      this.isActive = false;
      this.updatedAt = new Date();
    }
  }