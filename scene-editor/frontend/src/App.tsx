import React from "react";
import { Provider } from 'react-redux';

import { initInterceptor } from './util/interceptor'

import "./App.scss";
import AppRouter from "./AppRouter";
import { store } from "./Store"

const App: React.FC = () => {
    const {dispatch} = store;

    initInterceptor(dispatch);

    return ( 
        <Provider store={store}>
            <AppRouter />
        </Provider>
    );
};

export default App;
