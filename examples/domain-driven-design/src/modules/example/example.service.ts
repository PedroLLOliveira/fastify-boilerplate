import { ExampleBusiness } from './example.business';

export class ExampleService {
    private business: ExampleBusiness;

    constructor() {
        this.business = new ExampleBusiness();
    }

    getMessage(): string {
        return this.business.getMessage();
    }
}
