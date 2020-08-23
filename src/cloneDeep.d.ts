export default function cloneDeep<T>(
    val: T,
    instanceClone?: boolean | ((val: any, instancesMap: Map<any, any>) => any)
): T;

export function cloneDeep<T>(
    val: T,
    instanceClone?: boolean | ((val: any, instancesMap: Map<any, any>) => any)
): T;

export function cloneShallow<T>(
    val: T,
    instanceClone?: boolean | ((val: any) => any)
): T;