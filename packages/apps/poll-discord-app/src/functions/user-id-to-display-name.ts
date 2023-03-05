import { castWritable, IMap, Result, Str } from '@noshiro/ts-utils';
import type * as Discord from 'discord.js';
import { toUserId, type UserId } from '../types';
import { quoteIfSpaceIncluded } from './quote-if-space-included';

export const createUserIdToDisplayNameMap = async (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  guild: Discord.Guild | null,
  userIds: readonly UserId[] | undefined
): Promise<Result<IMap<UserId, string>, string>> => {
  if (guild === null) {
    return Result.err('guild is undefined');
  }

  const guildMembersResult: Result<
    Discord.Collection<string, Discord.GuildMember>,
    unknown
  > = await Result.fromPromise(
    userIds === undefined
      ? guild.members.fetch()
      : guild.members.fetch({ user: castWritable(userIds) })
  );

  if (Result.isErr(guildMembersResult)) {
    return Result.err(Str.from(guildMembersResult.value));
  }

  const guildMembers = guildMembersResult.value;

  const displayNameList: DeepReadonly<
    {
      userId: UserId;
      displayName: string;
    }[]
  > = guildMembers.map((u) => ({
    userId: toUserId(u.id),
    displayName: quoteIfSpaceIncluded(u.displayName),
  }));

  return Result.ok(
    IMap.new<UserId, string>(
      displayNameList.map(({ userId, displayName }) => [userId, displayName])
    )
  );
};
