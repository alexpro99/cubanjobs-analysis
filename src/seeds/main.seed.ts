import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';
import ormconfig from 'ormconfig';
import { seedChannels } from './channels-configurations.seed';
import { ChannelConfiguration } from 'src/channel-data-extraction/entities/channel-configurations.entity';
import { CachedMessage } from 'src/channel-data-extraction/entities/cached-messages.entity';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function runSeed() {
    // Configura tu conexión a la base de datos (usando los mismos valores que en tu AppModule)
    // por alguna razon hay que agregar las entidades aqui, si no no se pueden usar en el seed
    // Esto es necesario porque TypeORM no carga las entidades automáticamente en el contexto de los seeds
    const dataSource = new DataSource({ ...ormconfig, entities: [ChannelConfiguration, CachedMessage] });

    try {
        await dataSource.initialize();

        // Llama a tus funciones de seed
        await seedChannels(dataSource);

    } catch (error) {
        console.error('Seeding failed!', error);
    } finally {
        if (dataSource.isInitialized) {
            await dataSource.destroy();
        }
    }
}

runSeed();