import React, { useEffect, useState } from "react";
import { Provider } from 'react-redux';

import { initInterceptor } from './util/interceptor'

import { ThemeProvider, StyledEngineProvider, createTheme } from '@mui/material/styles';

import "./App.scss";
import AppRouter from "./AppRouter";
import { persistor, store } from "./Store"
import { Helmet, HelmetProvider } from "react-helmet-async";
import Hls from "hls.js";
import { PersistGate } from "redux-persist/integration/react";

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
            <HelmetProvider>
                <Helmet>
                    <meta name="apple-mobile-web-app-capable" content="yes" />
                </Helmet>
                <ThemeProvider theme={theme}>
                    <Provider store={store}>
                        <PersistGate loading={null} persistor={persistor}>
                            <HlsContext.Provider value={hls}>
                                <AppRouter />
                            </HlsContext.Provider>
                        </PersistGate>
                    </Provider>
                </ThemeProvider>
            </HelmetProvider>
        </StyledEngineProvider>
    );
};
