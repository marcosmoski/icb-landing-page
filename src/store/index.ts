import { configureStore } from '@reduxjs/toolkit';
import { cadastroApi } from './features/cadastroApi';

// Configuração da store Redux com RTK Query
export const store = configureStore({
  reducer: {
    // Adicionar reducers aqui conforme necessário
    [cadastroApi.reducerPath]: cadastroApi.reducer,
  },
  // Adicionar middleware do RTK Query
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(cadastroApi.middleware),
});

// Tipos TypeScript para uso em toda a aplicação
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Exportar hooks tipados
export { useDispatch, useSelector } from 'react-redux';
