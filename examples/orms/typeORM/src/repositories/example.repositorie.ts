import { AppDataSource } from '../database/connection';
import { Example } from '../entities/Example';
import { Repository } from 'typeorm';

export class ExampleRepository {
    private repo: Repository<Example>;

    constructor() {
        this.repo = AppDataSource.getRepository(Example);
    }

    async createExample(name: string, email: string) {
        const example = this.repo.create({ name, email });
        return this.repo.save(example);
    }

    async getAllExamples() {
        return this.repo.find();
    }
}
