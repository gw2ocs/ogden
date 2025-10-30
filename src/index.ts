import '#lib/setup';
import { OgdenClient } from '#lib/OgdenClient';
import { container } from '@sapphire/framework';
import { OgdenOrm } from '#lib/database';

const client = new OgdenClient();

const main = async () => {
	try {
		container.db = await OgdenOrm.connect();
		
		client.logger.info('Logging in');
		await client.login();
		client.logger.info('logged in');
	} catch (error) {
		client.logger.fatal(error);
		await client.destroy();
		process.exit(1);
	}
};

void main();
