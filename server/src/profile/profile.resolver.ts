import { Args, ID, Query, Resolver } from '@nestjs/graphql';

import { ProfileModel } from './models/profile.model';
import { ProfileService } from './profile.service';

@Resolver(() => ProfileModel)
export class ProfileResolver {
  constructor(private readonly profileService: ProfileService) {}

  @Query(() => [ProfileModel], { nullable: 'items' })
  public async profiles() {
    return this.profileService.findAll();
  }

  @Query(() => ProfileModel, {
    nullable: true,
  })
  public async profile(
    @Args('id', { type: () => ID })
    id: string,
  ) {
    return this.profileService.findOne(id);
  }
}
