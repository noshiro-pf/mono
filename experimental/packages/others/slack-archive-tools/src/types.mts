import * as t from '@noshiro/io-ts';
import { expectType } from '@noshiro/ts-utils';

const Users = t.nonEmptyArray(t.string());

const UserProfile = t.record({
  avatar_hash: t.string(),
  image_72: t.string(),
  first_name: t.string(),
  real_name: t.string(),
  display_name: t.string(),
  team: t.string(),
  name: t.string(),
  is_restricted: t.boolean(),
  is_ultra_restricted: t.boolean(),
});

const Reaction = t.record({
  name: t.string(),
  users: Users,
  count: t.positiveSafeInt(),
});

const Block = t.record({
  block_id: t.string(),
  type: t.string(),
  accessory: t.optional(t.unknown()),
  elements: t.optional(t.unknown()),
  text: t.optional(t.unknown()),
});

const Subtype = t.enumType([
  'thread_broadcast',
  'channel_purpose',
  'channel_join',
  'channel_archive',
  'tombstone',
  'bot_message',
  'channel_name',
  'channel_topic',
  'slack_image',
]);

const UserAndTimestamp = t.record({
  user: t.string(),
  ts: t.string(),
});

const BotProfile = t.record({
  app_id: t.string(),
  deleted: t.boolean(),
  icons: t.record({
    image_36: t.string(),
    image_48: t.string(),
    image_72: t.string(),
  }),
  id: t.string(),
  name: t.string(),
  team_id: t.string(),
  updated: t.number(),
});

const Attachment = t.record({
  fallback: t.string(),
  from_url: t.string(),

  author_icon: t.optional(t.unknown()),
  author_id: t.optional(t.unknown()),
  author_link: t.optional(t.unknown()),
  author_name: t.optional(t.unknown()),
  author_subname: t.optional(t.unknown()),
  channel_id: t.optional(t.unknown()),
  channel_team: t.optional(t.unknown()),
  color: t.optional(t.unknown()),
  fields: t.optional(t.unknown()),
  files: t.optional(t.unknown()),
  footer: t.optional(t.unknown()),
  id: t.optional(t.unknown()),
  image_bytes: t.optional(t.unknown()),
  image_height: t.optional(t.unknown()),
  image_url: t.optional(t.unknown()),
  image_width: t.optional(t.unknown()),
  is_msg_unfurl: t.optional(t.unknown()),
  is_reply_unfurl: t.optional(t.unknown()),
  is_share: t.optional(t.unknown()),
  is_thread_root_unfurl: t.optional(t.unknown()),
  message_blocks: t.optional(t.unknown()),
  mrkdwn_in: t.optional(t.unknown()),
  msg_subtype: t.optional(t.unknown()),
  original_url: t.optional(t.unknown()),
  service_icon: t.optional(t.unknown()),
  service_name: t.optional(t.unknown()),
  service_url: t.optional(t.unknown()),
  text: t.optional(t.unknown()),
  thumb_height: t.optional(t.unknown()),
  thumb_url: t.optional(t.unknown()),
  thumb_width: t.optional(t.unknown()),
  title: t.optional(t.unknown()),
  title_link: t.optional(t.unknown()),
  ts: t.optional(t.unknown()),
  video_html: t.optional(t.unknown()),
  video_html_height: t.optional(t.unknown()),
  video_html_width: t.optional(t.unknown()),
});

const MsgFile = t.record({
  id: t.string(),
  mode: t.string(),

  converted_pdf: t.optional(t.string()),
  created: t.optional(t.number()),
  deanimate: t.optional(t.string()),
  deanimate_gif: t.optional(t.string()),
  display_as_bot: t.optional(t.boolean()),
  duration_ms: t.optional(t.number()),
  edit_link: t.optional(t.string()),
  editable: t.optional(t.boolean()),
  external_id: t.optional(t.string()),
  external_type: t.optional(t.string()),
  external_url: t.optional(t.string()),
  file_access: t.optional(t.string()),
  filetype: t.optional(t.string()),
  has_rich_preview: t.optional(t.boolean()),
  hls: t.optional(t.string()),
  hls_embed: t.optional(t.string()),
  image_exif_rotation: t.optional(t.number()),
  is_external: t.optional(t.boolean()),
  is_public: t.optional(t.boolean()),
  is_starred: t.optional(t.boolean()),
  media_display_type: t.optional(t.string()),
  mimetype: t.optional(t.string()),
  mp4: t.optional(t.string()),
  mp4_low: t.optional(t.string()),
  name: t.optional(t.string()),
  original_h: t.optional(t.number()),
  original_w: t.optional(t.number()),
  permalink: t.optional(t.string()),
  permalink_public: t.optional(t.string()),
  pretty_type: t.optional(t.string()),
  public_url_shared: t.optional(t.boolean()),
  saved: t.optional(
    t.record({
      is_archived: t.boolean(),
      date_completed: t.number(),
      date_due: t.number(),
      state: t.string(),
    }),
  ),
  size: t.optional(t.number()),
  subtype: t.optional(t.string()),
  thumb_1024: t.optional(t.string()),
  thumb_1024_h: t.optional(t.number()),
  thumb_1024_w: t.optional(t.number()),
  thumb_160: t.optional(t.string()),
  thumb_360: t.optional(t.string()),
  thumb_360_gif: t.optional(t.string()),
  thumb_360_h: t.optional(t.number()),
  thumb_360_w: t.optional(t.number()),
  thumb_480: t.optional(t.string()),
  thumb_480_gif: t.optional(t.string()),
  thumb_480_h: t.optional(t.number()),
  thumb_480_w: t.optional(t.number()),
  thumb_64: t.optional(t.string()),
  thumb_720: t.optional(t.string()),
  thumb_720_h: t.optional(t.number()),
  thumb_720_w: t.optional(t.number()),
  thumb_80: t.optional(t.string()),
  thumb_800: t.optional(t.string()),
  thumb_800_h: t.optional(t.number()),
  thumb_800_w: t.optional(t.number()),
  thumb_960: t.optional(t.string()),
  thumb_960_h: t.optional(t.number()),
  thumb_960_w: t.optional(t.number()),
  thumb_pdf: t.optional(t.string()),
  thumb_pdf_h: t.optional(t.number()),
  thumb_pdf_w: t.optional(t.number()),
  thumb_tiny: t.optional(t.string()),
  thumb_video: t.optional(t.string()),
  thumb_video_h: t.optional(t.number()),
  thumb_video_w: t.optional(t.number()),
  timestamp: t.optional(t.number()),
  title: t.optional(t.string()),
  transcription: t.optional(
    t.record({
      status: t.string(),
      locale: t.optional(t.string()),
      preview: t.optional(
        t.record({
          content: t.string(),
          has_more: t.boolean(),
        }),
      ),
    }),
  ),
  url_private: t.optional(t.string()),
  url_private_download: t.optional(t.string()),
  user: t.optional(t.string()),
  user_team: t.optional(t.string()),
  username: t.optional(t.string()),
  vtt: t.optional(t.string()),
});

const Root = t.record({
  is_locked: t.boolean(),
  latest_reply: t.string(),
  replies: t.nonEmptyArray(UserAndTimestamp),
  reply_count: t.positiveSafeInt(),
  reply_users: Users,
  reply_users_count: t.positiveSafeInt(),
  subscribed: t.boolean(),
  text: t.string(),
  thread_ts: t.string(),
  ts: t.string(),
  type: t.string(),

  attachments: t.optional(t.nonEmptyArray(Attachment)),
  blocks: t.optional(t.nonEmptyArray(Block)),
  bot_id: t.optional(t.string()),
  bot_profile: t.optional(BotProfile),
  client_msg_id: t.optional(t.string()),
  display_as_bot: t.optional(t.boolean()),
  edited: t.optional(UserAndTimestamp),
  files: t.optional(t.nonEmptyArray(MsgFile)),
  last_read: t.optional(t.string()),
  subtype: t.optional(Subtype),
  team: t.optional(t.string()),
  upload: t.optional(t.boolean()),
  user: t.optional(t.string()),
  x_files: t.optional(t.nonEmptyArray(t.string())),
});

type Root = t.TypeOf<typeof Root>;

expectType<
  keyof Root,
  | 'attachments'
  | 'blocks'
  | 'bot_id'
  | 'bot_profile'
  | 'client_msg_id'
  | 'display_as_bot'
  | 'edited'
  | 'files'
  | 'is_locked'
  | 'last_read'
  | 'latest_reply'
  | 'replies'
  | 'reply_count'
  | 'reply_users'
  | 'reply_users_count'
  | 'subscribed'
  | 'subtype'
  | 'team'
  | 'text'
  | 'thread_ts'
  | 'ts'
  | 'type'
  | 'upload'
  | 'user'
  | 'x_files'
>('=');

const MessagePartial = t.partial(Root, {
  keysToBeOptional: [
    'is_locked',
    'latest_reply',
    'replies',
    'reply_count',
    'reply_users',
    'reply_users_count',
    'subscribed',
    'thread_ts',
  ],
});

type MessagePartial = t.TypeOf<typeof MessagePartial>;

expectType<keyof Root, keyof MessagePartial>('=');

export const Message = t.mergeRecords([
  MessagePartial,

  t.partial(
    t.record({
      hidden: t.boolean(),
      inviter: t.string(),
      name: t.string(),
      old_name: t.string(),
      parent_user_id: t.string(),
      purpose: t.string(),
      reactions: t.nonEmptyArray(Reaction),
      root: Root,
      source_team: t.string(),
      topic: t.string(),
      user_profile: UserProfile,
      user_team: t.string(),
    }),
  ),
]);

export type Message = t.TypeOf<typeof Message>;

expectType<Message, MessagePartial>('<=');

expectType<
  keyof Message,
  | keyof MessagePartial
  | 'hidden'
  | 'inviter'
  | 'name'
  | 'old_name'
  | 'parent_user_id'
  | 'purpose'
  | 'reactions'
  | 'root'
  | 'source_team'
  | 'topic'
  | 'user_profile'
  | 'user_team'
>('=');
