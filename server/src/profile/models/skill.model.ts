import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';

import { SkillCategory, SkillProficiency } from '@prisma/client';

registerEnumType(SkillCategory, {
  name: 'SkillCategory',
});

registerEnumType(SkillProficiency, {
  name: 'SkillProficiency',
});

@ObjectType()
export class SkillModel {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => SkillCategory, {
    nullable: true,
  })
  category?: SkillCategory;

  @Field(() => SkillProficiency, {
    nullable: true,
  })
  proficiency?: SkillProficiency;
}

@ObjectType()
export class ProfileSkillModel {
  @Field(() => SkillModel)
  skill: SkillModel;

  @Field({ nullable: true })
  note?: string;
}
