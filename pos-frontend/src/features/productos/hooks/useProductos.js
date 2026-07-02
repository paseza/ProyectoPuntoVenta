import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  actualizarProducto,
  buscarProductos,
  crearProducto,
  desactivarProducto,
  listarCategorias,
  reactivarProducto,
} from '../api/productos.api.js';

export function useProductos(busqueda) {
  return useQuery({
    queryKey: ['productos', busqueda],
    queryFn: () => buscarProductos({ buscar: busqueda }),
  });
}

export function useCategorias() {
  return useQuery({
    queryKey: ['categorias'],
    queryFn: listarCategorias,
  });
}

export function useCrearProducto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: crearProducto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      toast.success('Producto creado');
    },
  });
}

export function useActualizarProducto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ idProducto, cambios }) => actualizarProducto(idProducto, cambios),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      toast.success('Producto actualizado');
    },
  });
}

export function useCambiarEstadoProducto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ idProducto, activo }) =>
      activo ? reactivarProducto(idProducto) : desactivarProducto(idProducto),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      toast.success(variables.activo ? 'Producto reactivado' : 'Producto desactivado');
    },
  });
}
