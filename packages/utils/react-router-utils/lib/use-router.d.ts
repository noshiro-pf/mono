import { match } from 'react-router';
export declare const useMatch: <RouteParam>() => match<RouteParam>;
export declare const usePathNameList: <RouteParam>() => string[];
/**
 * `pathname !== history.location.pathname` is added to avoid a following warning:
 * "Hash history cannot PUSH the same path; a new entry will not be added to the history stack"
 */
export declare const useNavigator: <RouteParam>() => (pathname: string) => void;
//# sourceMappingURL=use-router.d.ts.map