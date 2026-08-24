import { Field, ID, ObjectType } from '@nestjs/graphql';

import { RecommendationModel } from './recommendation.model';
import { ExperienceModel } from './experience.model';
import { EducationModel } from './education.model';
import { ProfileSkillModel } from './skill.model';
import { LanguageModel } from './language.model';

@ObjectType()
export class ProfileModel {
  @Field(() => ID)
  id: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field({ nullable: true })
  middleName?: string;

  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  summary?: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  location?: string;

  @Field({ nullable: true })
  website?: string;

  @Field(() => [ExperienceModel])
  experiences: ExperienceModel[];

  @Field(() => [EducationModel])
  education: EducationModel[];

  @Field(() => [ProfileSkillModel])
  skills: ProfileSkillModel[];

  @Field(() => [LanguageModel])
  languages: LanguageModel[];

  @Field(() => [RecommendationModel])
  recommendations: RecommendationModel[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
