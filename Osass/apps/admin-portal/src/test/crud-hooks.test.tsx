import { act, renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createCrudHooks } from "@/hooks/createCrudHooks";

const toast = vi.hoisted(() => vi.fn());
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast }) }));

const setup = () => {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const invalidate = vi.spyOn(queryClient, "invalidateQueries");
  const create = vi.fn(async (_data: { name: string; password?: string }) => ({ id: "new" }));
  const update = vi.fn(async (_id: string, _data: { name: string }) => ({ id: "updated" }));
  const remove = vi.fn(async (_id: string) => {});
  const hooks = createCrudHooks<{ name: string; password?: string }, { name: string }>({
    label: "committee member",
    createdVerb: "added",
    removedVerb: "removed",
    invalidates: () => [["committeeMembers"], ["staff"]],
    create, update, remove,
  });
  const wrapper = ({ children }: { children: React.ReactNode }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  return { hooks, wrapper, invalidate, create, update, remove };
};

describe("generic admin CRUD hooks", () => {
  beforeEach(() => toast.mockClear());

  it("preserves create payloads, related query invalidation, and custom toast verbs", async () => {
    const { hooks, wrapper, create, invalidate } = setup();
    const { result } = renderHook(hooks.useCreate, { wrapper });
    await act(async () => { await result.current.mutateAsync({ name: "Member", password: "new-password" }); });
    expect(create).toHaveBeenCalledWith({ name: "Member", password: "new-password" });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["committeeMembers"] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["staff"] });
    expect(toast).toHaveBeenCalledWith({ title: "Success", description: "Committee member added successfully" });
  });

  it("supports a different update payload and passes the record ID", async () => {
    const { hooks, wrapper, update } = setup();
    const { result } = renderHook(hooks.useUpdate, { wrapper });
    await act(async () => { await result.current.mutateAsync({ id: "member-id", data: { name: "Updated Member" } }); });
    expect(update).toHaveBeenCalledWith("member-id", { name: "Updated Member" });
    expect(toast).toHaveBeenCalledWith({ title: "Success", description: "Committee member updated successfully" });
  });

  it("preserves delete IDs and removed wording", async () => {
    const { hooks, wrapper, remove } = setup();
    const { result } = renderHook(hooks.useRemove, { wrapper });
    await act(async () => { await result.current.mutateAsync("member-id"); });
    expect(remove).toHaveBeenCalledWith("member-id");
    expect(toast).toHaveBeenCalledWith({ title: "Success", description: "Committee member removed successfully" });
  });

  it("surfaces API failures without invalidating successful query caches", async () => {
    const { hooks, wrapper, create, invalidate } = setup();
    create.mockRejectedValueOnce(new Error("Email already exists"));
    const { result } = renderHook(hooks.useCreate, { wrapper });
    await act(async () => { await expect(result.current.mutateAsync({ name: "Member" })).rejects.toThrow("Email already exists"); });
    expect(invalidate).not.toHaveBeenCalled();
    expect(toast).toHaveBeenCalledWith({ title: "Error", description: "Email already exists", variant: "destructive" });
  });

  it("uses the operation fallback when the API error has no message", async () => {
    const { hooks, wrapper, remove } = setup();
    remove.mockRejectedValueOnce(new Error());
    const { result } = renderHook(hooks.useRemove, { wrapper });
    await act(async () => { await expect(result.current.mutateAsync("member-id")).rejects.toThrow(); });
    expect(toast).toHaveBeenCalledWith({ title: "Error", description: "Failed to remove committee member", variant: "destructive" });
  });
});
