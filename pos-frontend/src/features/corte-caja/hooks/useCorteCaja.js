import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { generarCorte, listarCortes } from '../api/corteCaja.api.js';

export function useGenerarCorte() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: generarCorte,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['turno-activo'] });
      queryClient.invalidateQueries({ queryKey: ['historial-cortes'] });
    },
  });
}

export function useHistorialCortes(filtro) {
  return useQuery({
    queryKey: ['historial-cortes', filtro],
    queryFn: () => listarCortes(filtro),
  });
}
