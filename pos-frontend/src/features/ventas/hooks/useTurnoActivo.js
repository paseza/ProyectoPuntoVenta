import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { abrirTurno, obtenerTurnoActivo } from '../api/turnos.api.js';
import { ApiError } from '../../../lib/apiClient.js';

export function useTurnoActivo() {
  return useQuery({
    queryKey: ['turno-activo'],
    queryFn: async () => {
      try {
        return await obtenerTurnoActivo();
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) {
          return null;
        }
        throw err;
      }
    },
  });
}

export function useAbrirTurno() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: abrirTurno,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['turno-activo'] });
    },
  });
}
