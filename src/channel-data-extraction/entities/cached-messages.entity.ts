import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ManyToOne } from "typeorm";
import { ChannelConfiguration } from "./channel-configurations.entity";


@Entity()
export class CachedMessage {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    messageHash: string;

    @ManyToOne(() => ChannelConfiguration, (channel) => channel.cachedMessages, { nullable: true })
    channel?: ChannelConfiguration;

    @Column()
    content: string;

    @Column()
    timestamp: Date;

    @Column()
    authorId: string;

    @Column({ nullable: true })
    authorName: string;

    @Column()
    fromClass: string

    @Column({ nullable: true, default: false })
    isProcessed: boolean;

    @Column({ nullable: true })
    messageId?: number;

    @Column({ default: 0 })
    touchedTimes: number

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}