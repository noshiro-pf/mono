// cspell:ignore accessib bcach bconcurren bduplicat befficien behaviou bidempoten bmemoi brecomput ormance
/** The categories a finding falls in; empty when it falls in none. */
export const classify = (text: string): readonly CategoryId[] =>
  CATEGORIES.filter(({ pattern }) => pattern.test(text)).map(({ id }) => id);

export type CategoryId = (typeof CATEGORIES)[number]['id'];

type Category = Readonly<{ id: string; label: string; pattern: RegExp }>;

/**
 * The classes of review finding the digest counts, each recognized by a
 * keyword pattern over the finding's text. A finding may fall in several;
 * one that matches none is listed verbatim under "other", which is where a
 * new class shows up first — add it here once it recurs.
 *
 * These are keywords, not understanding: they over- and under-count, and the
 * counts are a pointer for whoever reads the digest, never a gate.
 */
export const CATEGORIES = [
  {
    id: 'order',
    label: 'Declaration / file order',
    pattern:
      /\b(?:declaration|helper|function|definition|file|import|member|export)s? order(?:ing)?\b|\border(?:ing)? of (?:the )?(?:declarations|helpers|functions|definitions)\b|\bbefore (?:its|their) callers?\b|\btop-down\b|\b(?:defined|declared) (?:after|before)\b/iu,
  },
  {
    id: 'stale-docs',
    label: 'Stale or inaccurate docs, comments, README',
    pattern:
      /\bstale\b|\bout[- ]of[- ]date\b|\boutdated\b|\binaccurate\b|\boverstat|\bcontradict|\bREADME\b|\bJSDoc\b|\bdocs? (?:said|says|claimed|wording)\b|\bdoc comments?\b|\bdocumentation\b|\bcomments? (?:said|says|claimed)\b/iu,
  },
  {
    id: 'wording',
    label: 'Wording, typo, comment wrap',
    pattern:
      /\bwording\b|\bworded\b|\bphrasing\b|\btypos?\b|\bwrap(?:s|ped|ping)?\b|\bline width\b|\bragged\b|\bgrammar\b|\bspelling\b/iu,
  },
  {
    id: 'generated',
    label: 'Barrel / generated output',
    pattern:
      /\bbarrels?\b|\bindex\.mts\b|\bgen:\w+|\bgenerated\b|\bregenerat\w*/iu,
  },
  {
    id: 'test-gap',
    label: 'Test gap',
    pattern:
      /\buntested\b|\bno tests?\b|\bmissing tests?\b|\bnot (?:unit-)?tested\b|\bnot covered\b|\btests? (?:gap|coverage)\b|\bcoverage\b|\btests? for\b|\basserted only\b/iu,
  },
  {
    id: 'pre-existing',
    label: 'Pre-existing / predates the change',
    pattern:
      /\bpredates?\b|\bpre-?existing\b|\balready (?:the case|did|does|happens?|behaves)\b|\bexisting behaviou?r\b|\bon `?main`? too\b|\bbefore this (?:PR|pull request|change)\b|\bwas already\b/iu,
  },
  {
    id: 'out-of-scope',
    label: 'Out of scope',
    pattern:
      /\bout of scope\b|\bunrelated\b|\bseparate (?:issue|pull request|PR)\b|\bcross-app\b|\brepository-wide\b|\bfollow-up\b/iu,
  },
  {
    id: 're-raised',
    label: 'Re-raised after an earlier round dismissed it',
    pattern:
      /\balready (?:dismissed|raised|reported|answered)\b|\bre-?raised?\b|\braised again\b|\b(?:earlier|previous|prior) rounds?\b|\bsame finding\b/iu,
  },
  {
    id: 'a11y',
    label: 'Accessibility',
    pattern:
      /\ba11y\b|\baccessib\w*|\bscreen readers?\b|\baria-|\bfocus(?:ed|ing)?\b|\bforced-colors\b|\bkeyboard\b|\bcontrast\b|\balt text\b/iu,
  },
  {
    id: 'i18n',
    label: 'Japanese / i18n',
    pattern: /\bi18n\b|\bJapanese\b|\btranslat\w*|\blocali[sz]\w*/iu,
  },
  {
    id: 'edge-case',
    label: 'Edge case',
    pattern:
      /\bedge cases?\b|\bcorner cases?\b|\bempty\b|\bboundary\b|\brounding\b|\boverflow\w*|\bNaN\b|\boff[- ]by[- ]one\b|\brace\b|\bin flight\b|\bconcurren\w*|\bidempoten\w*|\bcrash\w*/iu,
  },
  {
    id: 'duplication',
    label: 'Duplication / shared helper',
    pattern:
      /\bduplicat\w*|\bcopied\b|\bcopy of\b|\bshared (?:helper|constant)\b|\brepeats?\b|\bsame (?:matcher|code|logic|helper)\b/iu,
  },
  {
    id: 'performance',
    label: 'Performance',
    pattern:
      /\bperf(?:ormance)?\b|\befficien\w*|\balloc\w*|\brecomput\w*|\bfaster\b|\bslow\w*|\bper update\b|\bcach(?:e|ing)\b|\bmemoi[sz]\w*/iu,
  },
  {
    id: 'type-safety',
    label: 'Cast / lint suppression',
    pattern:
      /\bcasts?\b|\beslint-disable\b|\bas unknown\b|\btype assertions?\b|\bnon-null\b/iu,
  },
  {
    id: 'changeset',
    label: 'Changeset / release',
    pattern: /\bchangesets?\b|\brelease notes?\b|\bCHANGELOG\b/iu,
  },
] as const satisfies readonly Category[];
