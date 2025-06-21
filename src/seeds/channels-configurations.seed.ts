import { ChannelConfiguration } from 'src/channel-data-extraction/entities/channel-configurations.entity';
import { getPrompt } from 'src/prompts/load-text-from-markdown';
import { DataSource } from 'typeorm';


export const seedChannels = async (dataSource: DataSource) => {
    const channelRepository = dataSource.getRepository(ChannelConfiguration);

    const channelsToSeed = [
        {
            channelName: 'cubanjobs', extractionFrequency: 10, messagesPerExtraction: 10, extractionPrompt: getPrompt('extraccion-ofertas-empleo')
        },
    ];




    for (const channelData of channelsToSeed) {
        const channel = channelRepository.create(channelData);
        await channelRepository.save(channel);
    }

    console.log('ChannelsConfig seeded successfully!');
};