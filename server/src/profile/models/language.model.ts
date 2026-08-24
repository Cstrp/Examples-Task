import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';

import { LanguageLevel } from '@prisma/client';

registerEnumType(LanguageLevel, {
  name: 'LanguageLevel',
});

@ObjectType()
export class LanguageModel {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => LanguageLevel)
  level: LanguageLevel;
}
