import { type Collection, type Guild, type GuildMember } from 'discord.js';
import { createUserId, type UserId } from '../types';
import { quoteIfSpaceIncluded } from './quote-if-space-included';

export const createUserIdToDisplayNameMap = async (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  guild: Readonly<Guild> | null,
  userIds: readonly UserId[] | undefined
): Promise<Result<IMap<UserId, string>, string>> => {
  const guildMembersResult:
    | Result<Collection<string, GuildMember> | undefined, string>
    | undefined = await Result.fromPromise(
    (userIds === undefined
      ? guild?.members.fetch()
      : guild?.members.fetch({ user: castWritable(userIds) })) ??
      Promise.reject(new Error('guild is undefined'))
  );

  if (Result.isErr(guildMembersResult)) {
    return guildMembersResult;
  }

  const guildMembers = guildMembersResult.value;

  const displayNameList:
    | DeepReadonly<
        {
          userId: UserId;
          displayName: string;
        }[]
      >
    | undefined = guildMembers?.map((u) => ({
    userId: createUserId(u.id),
    displayName: quoteIfSpaceIncluded(u.displayName),
  }));

  return Result.ok(
    IMap.new<UserId, string>(
      displayNameList?.map(({ userId, displayName }) => [
        userId,
        displayName,
      ]) ?? []
    )
  );
};
