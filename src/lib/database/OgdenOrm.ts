import type { DataSource, Repository } from 'typeorm';
import { connect } from './database.config.js';
import {
	AchievementEntity,
	ActivityEntity,
	AnswerEntity,
	ArticleEntity,
	CategorieEntity,
	GroupEntity,
	GuildEntity,
	ImageEntity,
	QuestionEntity,
	ScoreEntity,
	StatEntity,
	StatsMessageEntity,
	TaskEntity,
	TipEntity,
	UserEntity
} from "#lib/database/entities";
import { ClientRepository } from './repositories/ClientRepository.js';

export class OgdenOrm {
	public readonly connection: DataSource;
	public readonly achievements: Repository<AchievementEntity>
	public readonly activities: Repository<ActivityEntity>
	public readonly answers: Repository<AnswerEntity>
	public readonly articles: Repository<ArticleEntity>
	public readonly categories: Repository<CategorieEntity>
	public readonly clients: typeof ClientRepository
	public readonly groups: Repository<GroupEntity>
	public readonly guilds: Repository<GuildEntity>
	public readonly images: Repository<ImageEntity>
	public readonly questions: Repository<QuestionEntity>
	public readonly scores: Repository<ScoreEntity>
	public readonly stats: Repository<StatEntity>
	public readonly statMessages: Repository<StatsMessageEntity>
	public readonly tasks: Repository<TaskEntity>
	public readonly tips: Repository<TipEntity>
	public readonly users: Repository<UserEntity>

	private constructor(dataSource: DataSource) {
		this.connection = dataSource;
		this.achievements = this.connection.getRepository(AchievementEntity);
		this.activities = this.connection.getRepository(ActivityEntity);
		this.answers = this.connection.getRepository(AnswerEntity);
		this.articles = this.connection.getRepository(ArticleEntity);
		this.categories = this.connection.getRepository(CategorieEntity);
		this.clients = ClientRepository;
		this.groups = this.connection.getRepository(GroupEntity);
		this.guilds = this.connection.getRepository(GuildEntity);
		this.images = this.connection.getRepository(ImageEntity);
		this.questions = this.connection.getRepository(QuestionEntity);
		this.scores = this.connection.getRepository(ScoreEntity);
		this.stats = this.connection.getRepository(StatEntity);
		this.statMessages = this.connection.getRepository(StatsMessageEntity);
		this.tasks = this.connection.getRepository(TaskEntity);
		this.tips = this.connection.getRepository(TipEntity);
		this.users = this.connection.getRepository(UserEntity);
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
