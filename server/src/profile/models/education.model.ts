import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class EducationModel {
  @Field(() => ID)
  id: string;

  @Field()
  institution: string;

  @Field({ nullable: true })
  faculty?: string;

  @Field({ nullable: true })
  degree?: string;

  @Field({ nullable: true })
  startYear?: number;

  @Field({ nullable: true })
  endYear?: number;

  @Field({ nullable: true })
  description?: string;
}
