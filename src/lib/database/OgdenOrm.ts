import type { DataSource, Repository } from 'typeorm';
import { connect } from './database.config.js';
import {
	AchievementEntity,
	AnswerEntity,
	ArticleEntity,
	CategorieEntity,
	ClientEntity,
	GroupEntity,
	GuildEntity,
	GuildsUsersRelEntity,
	ImageEntity,
	QuestionEntity,
	StatEntity,
	StatsMessageEntity,
	TipEntity,
	UserEntity
} from "#lib/database/entities";

export class OgdenOrm {
	public readonly source: DataSource;
	public readonly achievements: Repository<AchievementEntity>
	public readonly answers: Repository<AnswerEntity>
	public readonly articles: Repository<ArticleEntity>
	public readonly categories: Repository<CategorieEntity>
	public readonly clients: Repository<ClientEntity>
	public readonly groups: Repository<GroupEntity>
	public readonly guilds: Repository<GuildEntity>
	public readonly guildsUsersRel: Repository<GuildsUsersRelEntity>
	public readonly images: Repository<ImageEntity>
	public readonly questions: Repository<QuestionEntity>
	public readonly stats: Repository<StatEntity>
	public readonly statMessages: Repository<StatsMessageEntity>
	public readonly tips: Repository<TipEntity>
	public readonly users: Repository<UserEntity>

	private constructor(dataSource: DataSource) {
		this.source = dataSource;
		this.achievements = this.source.getRepository(AchievementEntity);
		this.answers = this.source.getRepository(AnswerEntity);
		this.articles = this.source.getRepository(ArticleEntity);
		this.categories = this.source.getRepository(CategorieEntity);
		this.clients = this.source.getRepository(ClientEntity);
		this.groups = this.source.getRepository(GroupEntity);
		this.guilds = this.source.getRepository(GuildEntity);
		this.guildsUsersRel = this.source.getRepository(GuildsUsersRelEntity);
		this.images = this.source.getRepository(ImageEntity);
		this.questions = this.source.getRepository(QuestionEntity);
		this.stats = this.source.getRepository(StatEntity);
		this.statMessages = this.source.getRepository(StatsMessageEntity);
		this.tips = this.source.getRepository(TipEntity);
		this.users = this.source.getRepository(UserEntity);
	}

	public static instance: OgdenOrm | null = null;
	private static connectPromise: Promise<OgdenOrm> | null;

	public static async connect() {
		return (OgdenOrm.instance ??= await (OgdenOrm.connectPromise ??= connect().then((dataSource) => {
			OgdenOrm.connectPromise = null;
			return new OgdenOrm(dataSource);
		})));
	}

}
