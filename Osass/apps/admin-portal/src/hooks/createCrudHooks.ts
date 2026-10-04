import { useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export interface CrudConfig<TCreate, TUpdate> {
  label: string;
  createdVerb?: string;
  removedVerb?: string;
  invalidates: () => QueryKey[];
  create: (data: TCreate) => Promise<unknown>;
  update: (id: string, data: TUpdate) => Promise<unknown>;
  remove: (id: string) => Promise<void>;
}

export function createCrudHooks<TCreate, TUpdate = TCreate>(config: CrudConfig<TCreate, TUpdate>) {
  const { label, createdVerb = "created", removedVerb = "deleted", invalidates, create, update, remove } = config;
  const noun = label.charAt(0).toUpperCase() + label.slice(1);

  const useCrudMutation = <TVariables,>(mutationFn: (variables: TVariables) => Promise<unknown>, successMessage: string, fallbackError: string) => {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    return useMutation({
      mutationFn,
      onSuccess: () => {
        invalidates().forEach(queryKey => queryClient.invalidateQueries({ queryKey }));
        toast({ title: "Success", description: successMessage });
      },
      onError: (error: Error) => {
        toast({ title: "Error", description: error.message || fallbackError, variant: "destructive" });
      },
    });
  };

  return {
    useCreate: () => useCrudMutation((data: TCreate) => create(data), `${noun} ${createdVerb} successfully`, `Failed to ${createdVerb === "added" ? "add" : "create"} ${label}`),
    useUpdate: () => useCrudMutation(({ id, data }: { id: string; data: TUpdate }) => update(id, data), `${noun} updated successfully`, `Failed to update ${label}`),
    useRemove: () => useCrudMutation((id: string) => remove(id), `${noun} ${removedVerb} successfully`, `Failed to ${removedVerb === "removed" ? "remove" : "delete"} ${label}`),
  };
}
