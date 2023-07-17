import { BehaviorSubject, catchError, from, map, of } from "rxjs";

interface FetchResult<T> {
  value: T | undefined;
  loading: boolean;
  error: boolean;
}

const ERROR = { value: undefined, loading: false, error: true } as const;
const $ERROR = of(ERROR);
const LOADING = { value: undefined, loading: true, error: false } as const;

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

  public async load<K extends string & keyof T>(key: K): Promise<T[K]> {
    {
      const currentSubject = this.store[key];

      if (currentSubject !== undefined) return currentSubject.metadata;
    }

    const promise = fetch(new URL(key, this.baseUrl)).then(
      (response) => response.json() as Promise<T[K]>
    );

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
        (this.store[key] = new BehaviorSubjectWithMetadata<
          FetchResult<T[K]>,
          Promise<T[K]>
        >(LOADING, promise))
      );

    return promise;
  }

  constructor(public readonly baseUrl: string = "") {}

  public use<K extends keyof T>(key: K): T[K] {
    throw new Error("RestfulRepository.use hasn't been implemented.");
  }
}
