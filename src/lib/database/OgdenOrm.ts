import type { DataSource, Repository } from 'typeorm';
import { connect } from './database.config.js';
import {
	AchievementEntity,
	AchievementsUsersRelEntity,
	ActivityEntity,
	AnswerEntity,
	ArticleEntity,
	CategorieEntity,
	ChannelEntity,
	GroupEntity,
	GuildEntity,
	ImageEntity,
	QuestionEntity,
	QuizEntity,
	ScoreEntity,
	StatEntity,
	StatsMessageEntity,
	TaskEntity,
	TipEntity
} from "#lib/database/entities";
import { ClientRepository } from './repositories/ClientRepository.js';
import { UserRepository } from './repositories/UserRepository.js';

export class OgdenOrm {
	public readonly connection: DataSource;
	public readonly achievements: Repository<AchievementEntity>
	public readonly achievementsUsersRels: Repository<AchievementsUsersRelEntity>
	public readonly activities: Repository<ActivityEntity>
	public readonly answers: Repository<AnswerEntity>
	public readonly articles: Repository<ArticleEntity>
	public readonly categories: Repository<CategorieEntity>
	public readonly channels: Repository<ChannelEntity>
	public readonly clients: typeof ClientRepository
	public readonly groups: Repository<GroupEntity>
	public readonly guilds: Repository<GuildEntity>
	public readonly images: Repository<ImageEntity>
	public readonly questions: Repository<QuestionEntity>
	public readonly quizzes: Repository<QuizEntity>
	public readonly scores: Repository<ScoreEntity>
	public readonly stats: Repository<StatEntity>
	public readonly statMessages: Repository<StatsMessageEntity>
	public readonly tasks: Repository<TaskEntity>
	public readonly tips: Repository<TipEntity>
	public readonly users: typeof UserRepository

	private constructor(dataSource: DataSource) {
		this.connection = dataSource;
		this.achievements = this.connection.getRepository(AchievementEntity);
		this.achievementsUsersRels: this.connection.getRepository(AchievementsUsersRelEntity);
		this.activities = this.connection.getRepository(ActivityEntity);
		this.answers = this.connection.getRepository(AnswerEntity);
		this.articles = this.connection.getRepository(ArticleEntity);
		this.categories = this.connection.getRepository(CategorieEntity);
		this.channels = this.connection.getRepository(ChannelEntity);
		this.clients = ClientRepository;
		this.groups = this.connection.getRepository(GroupEntity);
		this.guilds = this.connection.getRepository(GuildEntity);
		this.images = this.connection.getRepository(ImageEntity);
		this.questions = this.connection.getRepository(QuestionEntity);
		this.quizzes = this.connection.getRepository(QuizEntity);
		this.scores = this.connection.getRepository(ScoreEntity);
		this.stats = this.connection.getRepository(StatEntity);
		this.statMessages = this.connection.getRepository(StatsMessageEntity);
		this.tasks = this.connection.getRepository(TaskEntity);
		this.tips = this.connection.getRepository(TipEntity);
		this.users = UserRepository;
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
