import { fetchAllPages, fetchStaff } from "@/services/api";
import { adminClient } from "@/services/apiClient";

const pageResult = (page: number, results: number[], totalPages = 3) => ({
  results,
  totalCount: 3,
  pageIndex: page,
  pageSize: 1,
  count: results.length,
  totalPages,
  lowerBoundSize: page,
  upperBoundSize: page,
});

describe("admin pagination", () => {
  afterEach(() => vi.restoreAllMocks());

  it("loads every page including a clamped short page", async () => {
    const fetchPage = vi.fn(async (page: number) => pageResult(page, [page]));
    expect(await fetchAllPages(fetchPage)).toEqual([1, 2, 3]);
    expect(fetchPage).toHaveBeenCalledTimes(3);
  });

  it("uses total count when total pages is unavailable", async () => {
    expect(await fetchAllPages(async page => pageResult(page, [page], 0))).toEqual([1, 2, 3]);
  });

  it("fails visibly rather than silently truncating an incomplete list", async () => {
    await expect(fetchAllPages(async page => pageResult(page, page === 1 ? [1] : []))).rejects.toThrow("before all records");
  });

  it("returns staff responses without recursive parsing", async () => {
    const data = { ...pageResult(1, []), totalCount: 0, totalPages: 0 };
    vi.spyOn(adminClient, "get").mockResolvedValue({ success: true, code: 200, message: "", data });
    expect(await fetchStaff()).toEqual(data);
  });
});
