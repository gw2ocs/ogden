import { UserEntity } from '#lib/database';
import type { FindOneOptions } from 'typeorm';
import { AppDataSource } from '#lib/database/database.config';
import type { User } from 'discord.js';


export const UserRepository = AppDataSource.getRepository(UserEntity).extend({
    async ensure(user: User, options?: FindOneOptions<UserEntity>) {
        let _user = await this.findOne({ where: { discordId: user.id }, ...options });
        if (!_user) {
            _user = this.create({
                discordId: user.id,
                username: user.username,
                discriminator: user.discriminator,
                avatar: user.avatar
            });
            _user = await this.save(_user);
        }
        return _user;
    }
})