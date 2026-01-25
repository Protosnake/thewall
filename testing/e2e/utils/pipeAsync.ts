export default async function pipeAsync<T>(data: T, ...fns: Array<(arg: T) => T | Promise<T>>) {
  for (const fn of fns) {
    data = await fn(data);
  }
  return data;
}
