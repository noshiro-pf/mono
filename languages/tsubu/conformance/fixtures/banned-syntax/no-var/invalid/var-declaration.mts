// @tsubu-expect banned-syntax/no-var
var mut_count = 0;

mut_count += 1;

export const result = mut_count;
