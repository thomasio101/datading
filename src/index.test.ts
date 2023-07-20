import { restfulRepositoryFixture } from "./utils/testing";
import { renderHook } from "@testing-library/react";
import { sleep } from "./utils/time";

test(
  "Test .use",
  restfulRepositoryFixture(async (repository) => {
    const { result, unmount } = renderHook(() => repository.use("posts/1"));

    expect(result.current.value).toBe(undefined);

    await sleep(250);

    expect(result.current.value).toBeDefined();
    expect(result.current.value!.id).toBe(1);

    unmount();
  })
);
