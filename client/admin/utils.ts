export function getEnumOptions<T extends string | number, M extends Record<T, string>>(enumObj: Record<string, T>, nameMap: M) {
  return Object.entries(enumObj)
    .filter(([_key, value]) => !isNaN(Number(value)) || typeof value === 'string')  // 保留数字和字符串类型的值
    .filter(([key, _value]) => isNaN(Number(key)))  // 过滤掉数字键（枚举的反向映射）
    .map(([_key, value]) => ({
      label: nameMap[value as T],
      value: value
    }));
}