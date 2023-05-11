import React, { useEffect, useState } from "react";
import { Provider } from 'react-redux';

import { initInterceptor } from './util/interceptor'

import { ThemeProvider, Theme, StyledEngineProvider, createTheme } from '@mui/material/styles';

import "./App.scss";
import AppRouter from "./AppRouter";
import { store } from "./Store"
import {Helmet} from "react-helmet";
import Hls from "hls.js";

declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

const theme = createTheme();

export const HlsContext = React.createContext<Hls | undefined>(undefined);

export const App: React.FC = () => {
    const {dispatch} = store;
    const [hls, setHls] = useState<Hls | undefined>(undefined);

    initInterceptor(dispatch);

    useEffect(() => {
        setHls(new Hls({
            startLevel: -1, // download lowest quality variant as speed test
            capLevelOnFPSDrop: true,
        }));
    }, []);

    return (
        <StyledEngineProvider injectFirst>
            <Helmet>
                <meta name="apple-mobile-web-app-capable" content="yes" />
            </Helmet>
            <ThemeProvider theme={theme}>
                <Provider store={store}>
                    <HlsContext.Provider value={hls}>
                        <AppRouter />
                    </HlsContext.Provider>
                </Provider>
            </ThemeProvider>
        </StyledEngineProvider>
    );
};
