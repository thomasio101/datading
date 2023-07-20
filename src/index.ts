import { useBehaviorSubjectValue } from "haakje";
import { BehaviorSubject, catchError, from, map, of } from "rxjs";

interface FetchResult<T> {
  value: T | undefined;
  loading: boolean;
  error: boolean;
}

const ERROR = {
  value: undefined,
  loading: false,
  error: true,
} as const satisfies FetchResult<undefined>;
const $ERROR = of(ERROR);
const LOADING = {
  value: undefined,
  loading: true,
  error: false,
} as const satisfies FetchResult<undefined>;

class BehaviorSubjectWithMetadata<T, M> extends BehaviorSubject<T> {
  constructor(value: T, public readonly metadata: M) {
    super(value);
  }
}

export class RestfulRepository<T extends Record<string, any>> {
  private readonly store: {
    [k in keyof T]?: BehaviorSubjectWithMetadata<
      FetchResult<T[k]>,
      Promise<T[k]>
    >;
  } = {};

  constructor(public readonly baseURL: string = "") {}

  private getSubject<K extends string & keyof T>(
    key: K
  ): BehaviorSubjectWithMetadata<FetchResult<T[K]>, Promise<T[K]>> {
    {
      const currentSubject = this.store[key];

      if (currentSubject !== undefined) return currentSubject;
    }

    const promise = fetch(new URL(key, this.baseURL)).then(
      (response) => response.json() as Promise<T[K]>
    );

    let subject;

    from(promise)
      .pipe(
        map((value): FetchResult<T[K]> & { value: T[K] } => ({
          value,
          loading: false,
          error: false,
        })),
        catchError(() => $ERROR)
      )
      .subscribe(
        (subject = this.store[key] =
          new BehaviorSubjectWithMetadata<FetchResult<T[K]>, Promise<T[K]>>(
            LOADING,
            promise
          ))
      );

    return subject;
  }

  public load<K extends string & keyof T>(key: K): Promise<T[K]> {
    return this.getSubject(key).metadata;
  }

  public use<K extends string & keyof T>(key: K): FetchResult<T[K]> {
    return useBehaviorSubjectValue(this.getSubject(key));
  }
}
