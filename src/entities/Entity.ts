import db from "../database/index.js";

export interface IEntity<T extends { id: string; createdAt: string }> {
  create(input: Omit<T, "id" | "createdAt">): Promise<T>;
  read(payload: {
    id?: T["id"];
    filter?: Partial<T>;
    limit: number;
    offset: number;
  }): Promise<T[]>;
  update(input: Partial<T>): Promise<T>;
  delete(id: Pick<T, "id">): Promise<boolean>;
}

export default abstract class Entity<
  T extends { id: string; createdAt: string }
> implements IEntity<T>
{
  constructor(readonly db: db) {}

  abstract create(input: Omit<T, "id" | "createdAt">): Promise<T>;
  abstract read(payload: {
    id?: T["id"];
    filter?: Partial<T>;
    limit: number;
    offset: number;
  }): Promise<T[]>;
  abstract update(input: Partial<T>): Promise<T>;
  abstract delete(id: Pick<T, "id">): Promise<boolean>;
}
