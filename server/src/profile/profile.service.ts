import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma';

@Injectable()
export class ProfileService {
  private readonly logger: Logger = new Logger(ProfileService.name);

  constructor(private readonly prisma: PrismaService) {}

  public async findAll() {
    const profiles = await this.prisma.profile.findMany({
      include: {
        experiences: true,
        education: true,
        skills: { include: { skill: true } },
        languages: true,
        recommendations: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    this.logger.debug(`Found ${profiles.length} profiles`);

    return profiles;
  }

  public async findOne(id: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { id },
      include: {
        experiences: true,
        education: true,
        skills: { include: { skill: true } },
        languages: true,
        recommendations: true,
      },
    });

    if (!profile) {
      throw new NotFoundException(`Profile ${id} not found.`);
    }

    this.logger.debug(`Found profile ${id}`);

    return profile;
  }
}
