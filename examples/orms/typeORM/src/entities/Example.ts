import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('examples')
export class Example {
    @PrimaryGeneratedColumn('uuid')
        id!: string;

    @Column()
        name!: string;

    @Column({ unique: true })
        email!: string;
}
