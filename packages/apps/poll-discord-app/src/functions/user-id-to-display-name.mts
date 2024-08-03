import type * as Discord from 'discord.js';
import { toUserId, type UserId } from '../types/index.mjs';
import { quoteIfSpaceIncluded } from './quote-if-space-included.mjs';

export const createUserIdToDisplayNameMap = async (
  guild: Discord.Guild | null,
  userIds: readonly UserId[] | undefined,
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
      : guild.members.fetch({ user: castMutable(userIds) }),
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
      displayNameList.map(({ userId, displayName }) => [userId, displayName]),
    ),
  );
};
