import { Entity, PrimaryGeneratedColumn } from "typeorm";
import { Column } from "typeorm";

@Entity()
export class CubanJobs {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ nullable: true })
    title?: string;

    @Column({ nullable: true })
    summary?: string;

    @Column({ nullable: true })
    company?: string;

    @Column({ nullable: true })
    location?: string;

    @Column({ type: "float", nullable: true })
    salary?: number;

    @Column({ nullable: true })
    salary_currency?: string;

    @Column()
    date: string;

    @Column("simple-array", { nullable: true })
    technologies?: string[];

    @Column({ nullable: true })
    telegramUserId: number;

    @Column({ nullable: true })
    experience_level?: string;

    @Column({ nullable: true })
    contract_type?: string;

    @Column({ nullable: true })
    english_level?: string;

    @Column({ nullable: true })
    remote?: boolean;

    @Column()
    oferta_id: number;
}
