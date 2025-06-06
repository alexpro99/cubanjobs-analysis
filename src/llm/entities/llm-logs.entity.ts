import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class LlmLog {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column()
    modelName: string;

    @Column()
    prompt: string;

    @Column()
    response: string;

    @Column({ nullable: true })
    error?: string;

    @Column({ type: 'json', nullable: true })
    metadata?: Record<string, any>;

    @Column()
    provider: string;

    @Column({ nullable: true })
    action: string;

    @Column({ nullable: true })
    description: string;

}