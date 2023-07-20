import { restfulRepositoryFixture } from "./utils/testing";
import { renderHook } from "@testing-library/react";

test(
  "Test .use",
  restfulRepositoryFixture(async (repository) => {
    const { result, unmount } = renderHook(() => repository.use("posts/1"));

    expect(result.current.value).toBe(undefined);

    unmount();
  })
);
