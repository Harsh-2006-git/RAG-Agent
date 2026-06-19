import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentAPI } from '../services/api';

export function useDocuments() {
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: ['documents'],
    queryFn: documentAPI.list,
  });

  const uploadMutation = useMutation({
    mutationFn: ({ files, onProgress }) => documentAPI.upload(files, onProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });

  const processMutation = useMutation({
    mutationFn: (documentIds) => documentAPI.process(documentIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (documentId) => documentAPI.delete(documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });

  return {
    documents: listQuery.data?.documents || [],
    isLoading: listQuery.isLoading,
    isError: listQuery.isError,
    upload: uploadMutation.mutateAsync,
    isUploading: uploadMutation.isPending,
    process: processMutation.mutateAsync,
    isProcessing: processMutation.isPending,
    deleteDoc: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
