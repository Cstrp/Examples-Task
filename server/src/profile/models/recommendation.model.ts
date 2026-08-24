import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class RecommendationModel {
  @Field(() => ID)
  id: string;

  @Field()
  authorName: string;

  @Field({ nullable: true })
  authorRole?: string;

  @Field({ nullable: true })
  authorOrg?: string;

  @Field()
  content: string;

  @Field({ nullable: true })
  contact?: string;

  @Field()
  createdAt: Date;
}
