import { MercuriusDriver, MercuriusDriverConfig } from '@nestjs/mercurius';
import { ProfileModule } from './profile/profile.module';
import { PrismaModule } from './prisma/prisma.module';
import { AppController } from './app.controller';
import { GraphQLModule } from '@nestjs/graphql';
import { AppService } from './app.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    GraphQLModule.forRoot<MercuriusDriverConfig>({
      driver: MercuriusDriver,
      transformAutoSchemaFile: true,
      autoSchemaFile:
        process.env.NODE_ENV === 'production' ? true : 'schema.gql',
      subscription: true,
      sortSchema: true,
      path: '/graphql',
    }),
    PrismaModule,
    ProfileModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
