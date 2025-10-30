import { ClientEntity } from '#lib/database';
import type { FindOneOptions } from 'typeorm';
import { AppDataSource } from '#lib/database/database.config';


export const ClientRepository = AppDataSource.getRepository(ClientEntity).extend({
    async ensure(options?: FindOneOptions<ClientEntity>) {
		return (await this.findOne({ where: { discordId: process.env.CLIENT_ID }, ...options })) ?? new ClientEntity();
	}
})