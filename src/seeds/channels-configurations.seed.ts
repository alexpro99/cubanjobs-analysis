import { ChannelConfiguration } from 'src/channel-data-extraction/entities/channel-configurations.entity';
import { DataSource } from 'typeorm';

export const seedChannels = async (dataSource: DataSource) => {
    const channelRepository = dataSource.getRepository(ChannelConfiguration);

    const channelsToSeed = [
        {
            channelName: 'cubanjobs', extractionFrequency: 10, messagesPerExtraction: 10, extractionPrompt: `You are an expert extraction algorithm.
    Only extract relevant information from the text.
    If you do not know the value of an attribute asked to extract,
    return null for the attribute's value.` },
    ];

    for (const channelData of channelsToSeed) {
        const channel = channelRepository.create(channelData);
        await channelRepository.save(channel);
    }

    console.log('ChannelsConfig seeded successfully!');
};