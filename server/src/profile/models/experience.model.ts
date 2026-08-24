import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ExperienceModel {
  @Field(() => ID)
  id: string;

  @Field()
  company: string;

  @Field()
  position: string;

  @Field()
  startDate: Date;

  @Field({ nullable: true })
  endDate?: Date;

  @Field({ nullable: true })
  location?: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => [String])
  highlights: string[];
}
