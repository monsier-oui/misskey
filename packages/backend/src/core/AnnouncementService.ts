/*
 * SPDX-FileCopyrightText: syuilo and other misskey contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Inject, Injectable } from '@nestjs/common';
import { Brackets, In } from 'typeorm';
import type { AnnouncementReadsRepository, AnnouncementsRepository, UsersRepository } from '@/models/_.js';
import type { MiUser } from '@/models/User.js';
import { MiAnnouncement, MiAnnouncementRead } from '@/models/_.js';
import { AnnouncementEntityService } from '@/core/entities/AnnouncementEntityService.js';
import { bindThis } from '@/decorators.js';
import { DI } from '@/di-symbols.js';
import { GlobalEventService } from '@/core/GlobalEventService.js';
import { IdService } from '@/core/IdService.js';
import { Packed } from '@/misc/json-schema.js';
import { UserEntityService } from '@/core/entities/UserEntityService.js';
import { ModerationLogService } from '@/core/ModerationLogService.js';

@Injectable()
export class AnnouncementService {
	constructor(
		@Inject(DI.announcementsRepository)
		private announcementsRepository: AnnouncementsRepository,

		@Inject(DI.announcementReadsRepository)
		private announcementReadsRepository: AnnouncementReadsRepository,

		@Inject(DI.usersRepository)
		private usersRepository: UsersRepository,

		private idService: IdService,
		private userEntityService: UserEntityService,
		private announcementEntityService: AnnouncementEntityService,
		private globalEventService: GlobalEventService,
		private moderationLogService: ModerationLogService,
	) {}

	@bindThis
	public async create(
		values: Partial<MiAnnouncement>, moderator: MiUser,
	): Promise<{ raw: MiAnnouncement; packed: Packed<'Announcement'> }> {
		const announcement = await this.announcementsRepository
			.insert({
				id: this.idService.genId(),
				createdAt: new Date(),
				updatedAt: null,
				title: values.title,
				text: values.text,
				imageUrl: values.imageUrl,
				icon: values.icon,
				display: values.display,
				forExistingUsers: values.forExistingUsers,
				needConfirmationToRead: values.needConfirmationToRead,
				closeDuration: values.closeDuration,
				displayOrder: values.displayOrder,
				userId: values.userId,
			})
			.then((x) =>
				this.announcementsRepository.findOneByOrFail(x.identifiers[0]),
			);

		const packed = await this.announcementEntityService.pack(
			announcement,
			null,
		);

		if (values.userId) {
			this.globalEventService.publishMainStream(
				values.userId,
				'announcementCreated',
				{
					announcement: packed,
				},
			);

			this.moderationLogService.log(moderator, 'createUserAnnouncement', {
				announcementId: announcement.id,
				announcement: announcement,
				userId: values.userId,
			});
		} else {
			this.globalEventService.publishBroadcastStream('announcementCreated', {
				announcement: packed,
			});

			this.moderationLogService.log(moderator, 'createGlobalAnnouncement', {
				announcementId: announcement.id,
				announcement: announcement,
			});
		}

		return {
			raw: announcement,
			packed: packed,
		};
	}

	@bindThis
	public async list(
		userId: MiUser['id'] | null,
		limit: number,
		offset: number,
		moderator: MiUser,
	): Promise<(MiAnnouncement & { userInfo: Packed<'UserLite'> | null, readCount: number })[]> {
		const query = this.announcementsRepository.createQueryBuilder('announcement');
		if (userId) {
			query.andWhere('announcement."userId" = :userId', { userId: userId });
		} else {
			query.andWhere('announcement."userId" IS NULL');
		}

		query.orderBy({
			'announcement."displayOrder"': 'DESC',
			'announcement."createdAt"': 'DESC',
		});

		const announcements = await query
			.limit(limit)
			.offset(offset)
			.getMany();

		const reads = new Map<MiAnnouncement, number>();

		for (const announcement of announcements) {
			reads.set(announcement, await this.announcementReadsRepository.countBy({
				announcementId: announcement.id,
			}));
		}

		const users = await this.usersRepository.findBy({
			id: In(announcements.map(a => a.userId).filter(id => id != null)),
		});
		const packedUsers = await this.userEntityService.packMany(users, moderator, {
			detail: false,
		});

		return announcements.map(announcement => ({
			...announcement,
			userInfo: packedUsers.find(u => u.id === announcement.userId) ?? null,
			readCount: reads.get(announcement) ?? 0,
		}));
	}

	@bindThis
	public async update(
		announcementId: MiAnnouncement['id'], moderator: MiUser,
		values: Partial<MiAnnouncement>,
	): Promise<{ raw: MiAnnouncement; packed: Packed<'Announcement'> }> {
		const oldAnnouncement = await this.announcementsRepository.findOneByOrFail({
			id: announcementId,
		});

		if (oldAnnouncement.userId && oldAnnouncement.userId !== values.userId) {
			await this.announcementReadsRepository.delete({
				announcementId: announcementId,
				userId: oldAnnouncement.userId,
			});
		}

		const announcement = await this.announcementsRepository
			.update(announcementId, {
				updatedAt: new Date(),
				isActive: values.isActive,
				title: values.title,
				text: values.text,
				imageUrl: values.imageUrl !== '' ? values.imageUrl : null,
				icon: values.icon,
				display: values.display,
				forExistingUsers: values.forExistingUsers,
				needConfirmationToRead: values.needConfirmationToRead,
				closeDuration: values.closeDuration,
				displayOrder: values.displayOrder,
				userId: values.userId,
			})
			.then(() =>
				this.announcementsRepository.findOneByOrFail({ id: announcementId }),
			);

		const packed = await this.announcementEntityService.pack(
			announcement,
			values.userId ? { id: values.userId } : null,
		);

		if (values.userId) {
			this.globalEventService.publishMainStream(
				values.userId,
				'announcementCreated',
				{
					announcement: packed,
				},
			);

			if (moderator) {
				this.moderationLogService.log(moderator, 'createUserAnnouncement', {
					announcementId: announcement.id,
					announcement: announcement,
					userId: values.userId,
				});
			}
		} else {
			this.globalEventService.publishBroadcastStream('announcementCreated', {
				announcement: packed,
			});

			if (moderator) {
				this.moderationLogService.log(moderator, 'createGlobalAnnouncement', {
					announcementId: announcement.id,
					announcement: announcement,
				});
			}
		}

		return {
			raw: announcement,
			packed: packed,
		};
	}

	@bindThis
	public async delete(announcementId: MiAnnouncement['id']): Promise<void> {
		await this.announcementReadsRepository.delete({
			announcementId: announcementId,
		});
		await this.announcementsRepository.delete({ id: announcementId });
	}

	@bindThis
	public async getAnnouncements(
		me: MiUser | null,
		limit: number,
		offset: number,
		isActive?: boolean,
	): Promise<Packed<'Announcement'>[]> {
		const query = this.announcementsRepository.createQueryBuilder('announcement');
		if (me) {
			query.leftJoin(
				MiAnnouncementRead,
				'read',
				'read."announcementId" = announcement.id AND read."userId" = :userId',
				{ userId: me.id },
			);
			query.select([
				'announcement.*',
				'CASE WHEN read.id IS NULL THEN FALSE ELSE TRUE END as "isRead"',
			]);
			query
				.andWhere(
					new Brackets((qb) => {
						qb.orWhere('announcement."userId" = :userId', { userId: me.id });
						qb.orWhere('announcement."userId" IS NULL');
					}),
				)
				.andWhere(
					new Brackets((qb) => {
						qb.orWhere('announcement."forExistingUsers" = false');
						qb.orWhere('announcement."createdAt" > :createdAt', {
							createdAt: me.createdAt,
						});
					}),
				);
		} else {
			query.select([
				'announcement.*',
				'NULL as "isRead"',
			]);
			query.andWhere('announcement."userId" IS NULL');
			query.andWhere('announcement."forExistingUsers" = false');
		}

		if (isActive !== undefined) {
			query.andWhere('announcement."isActive" = :isActive', {
				isActive: isActive,
			});
		}

		query.orderBy({
			'"isRead"': 'ASC',
			'announcement."displayOrder"': 'DESC',
			'announcement."createdAt"': 'DESC',
		});

		return this.announcementEntityService.packMany(
			await query
				.limit(limit)
				.offset(offset)
				.getRawMany<MiAnnouncement & { isRead?: boolean | null }>(),
			me,
		);
	}

	@bindThis
	public async getUnreadAnnouncements(me: MiUser): Promise<Packed<'Announcement'>[]> {
		const query = this.announcementsRepository.createQueryBuilder('announcement');
		query.leftJoinAndSelect(
			MiAnnouncementRead,
			'read',
			'read."announcementId" = announcement.id AND read."userId" = :userId',
			{ userId: me.id },
		);
		query.andWhere('read.id IS NULL');
		query.andWhere('announcement."isActive" = true');

		query
			.andWhere(
				new Brackets((qb) => {
					qb.orWhere('announcement."userId" = :userId', { userId: me.id });
					qb.orWhere('announcement."userId" IS NULL');
				}),
			)
			.andWhere(
				new Brackets((qb) => {
					qb.orWhere('announcement."forExistingUsers" = false');
					qb.orWhere('announcement."createdAt" > :createdAt', {
						createdAt: me.createdAt,
					});
				}),
			);

		query.orderBy({
			'announcement."displayOrder"': 'DESC',
			'announcement."createdAt"': 'DESC',
		});

		return this.announcementEntityService.packMany(
			await query.getMany(),
			me,
		);
	}

	@bindThis
	public async countUnreadAnnouncements(me: MiUser): Promise<number> {
		const query = this.announcementsRepository.createQueryBuilder('announcement');
		query.leftJoinAndSelect(
			MiAnnouncementRead,
			'read',
			'read."announcementId" = announcement.id AND read."userId" = :userId',
			{ userId: me.id },
		);
		query.andWhere('read.id IS NULL');
		query.andWhere('announcement."isActive" = true');

		query
			.andWhere(
				new Brackets((qb) => {
					qb.orWhere('announcement."userId" = :userId', { userId: me.id });
					qb.orWhere('announcement."userId" IS NULL');
				}),
			)
			.andWhere(
				new Brackets((qb) => {
					qb.orWhere('announcement."forExistingUsers" = false');
					qb.orWhere('announcement."createdAt" > :createdAt', {
						createdAt: me.createdAt,
					});
				}),
			);

		return query.getCount();
	}

	@bindThis
	public async markAsRead(
		me: MiUser,
		announcementId: MiAnnouncement['id'],
	): Promise<void> {
		try {
			await this.announcementReadsRepository.insert({
				id: this.idService.genId(),
				createdAt: new Date(),
				announcementId: announcementId,
				userId: me.id,
			});
		} catch (e) {
			return;
		}

		if ((await this.countUnreadAnnouncements(me)) === 0) {
			this.globalEventService.publishMainStream(me.id, 'readAllAnnouncements');
		}
	}
}
