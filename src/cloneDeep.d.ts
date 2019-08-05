export default function cloneDeep<T>(
    val: T,
    instanceClone?: boolean | ((val: any, instancesMap: Map<any, any>) => any)
): T;
