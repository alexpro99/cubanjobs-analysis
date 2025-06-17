import { Entity, OneToMany } from "typeorm";
import { PrimaryGeneratedColumn, Column } from "typeorm";
import { CachedMessage } from "./cached-messages.entity";


@Entity()
export class ChannelConfiguration {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    channelName: string;

    @OneToMany(() => CachedMessage, (cachedMessage) => cachedMessage.channel, { nullable: true })
    cachedMessages: CachedMessage[];

    @Column()
    extractionFrequency: number;
    @Column()
    messagesPerExtraction: number;

    @Column({ nullable: true, default: 5 })
    messagesAnalysisFrequency: number
    @Column({ nullable: true, default: 10 })
    messageAnalysisBatchSize: number

    @Column("text")
    extractionPrompt: string;

    @Column({ default: 0 })
    lastExtractedMessageId: number;

}
