import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma';

@Injectable()
export class ProfileService {
  private readonly logger: Logger = new Logger(ProfileService.name);

  constructor(private readonly prisma: PrismaService) {}

  public async findAll() {
    return this.prisma.profile.findMany({
      include: {
        experiences: true,
        education: true,
        skills: { include: { skill: true } },
        languages: true,
        recommendations: true,
      },
      orderBy: { createdAt: 'desc' },
    });
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

    return profile;
  }
}
