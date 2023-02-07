import React from "react";
import { Provider } from 'react-redux';

import { initInterceptor } from './util/interceptor'

import { ThemeProvider, Theme, StyledEngineProvider, createTheme } from '@mui/material/styles';

import "./App.scss";
import AppRouter from "./AppRouter";
import { store } from "./Store"


declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}


const theme = createTheme();

const App: React.FC = () => {
    const {dispatch} = store;

    initInterceptor(dispatch);

    return (
        <StyledEngineProvider injectFirst>
            <ThemeProvider theme={theme}>
                <Provider store={store}>
                    <AppRouter />
                </Provider>
            </ThemeProvider>
        </StyledEngineProvider>
    );
};

export default App;
