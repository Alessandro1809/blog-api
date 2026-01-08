export function safeJsonParse<T>(value: string | null | undefined, defaultValue: T): T {
  if (!value || value === '' || value === '-') {
    return defaultValue;
  }
  
  try {
    return JSON.parse(value) as T;
  } catch {
    return defaultValue;
  }
}

export function safeJsonStringify(value: any): string {
  if (value === null || value === undefined) {
    return '[]';
  }
  
  try {
    return JSON.stringify(value);
  } catch {
    return '[]';
  }
}
