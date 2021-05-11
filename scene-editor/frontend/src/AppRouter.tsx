import React, { useEffect } from "react";
import { BrowserRouter, Switch, Route, Redirect } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';

import { retrieveToken } from './actions/tokenActions'

import { View } from './types/views';

import PageNotFound from "./pages/PageNotFound/PageNotFound";
import Settings from "./pages/Settings/Settings";
import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import Editor from "./pages/Editor/Editor";
import ScenarioEditor from "./pages/ScenarioEditor/ScenarioEditor"
import TimelineEditor from "./pages/TimelineEditor/TimelineEditor"
import ScenePlayer from "./pages/ScenePlayer/ScenePlayer";
import Project from "./pages/Project/Project";
import ScenarioPlayer from "./pages/ScenarioPlayer/ScenarioPlayer";

const AppRouter: React.FC = () => {
    // TODO: routes should be protected in the future
    const token = useSelector((state:any) => state.token)
    const hasToken = () => token.id !== "" && token.id !== null;
    const dispatch = useDispatch();

    useEffect(() => {
        if (!hasToken()) {
            dispatch(retrieveToken())
        }
    }, [])

    return (
        hasToken() ?
        <BrowserRouter>
            <Switch>
                <Redirect exact from="/" to="/projects" />
                <Route path="/scenario-editor/:projectID/:scenarioID" component={ScenarioEditor}></Route>
                <Route path="/timeline-editor/:projectID/:timelineID" component={TimelineEditor}></Route>
                <Route path="/editor/:project_id/:scene_id" component={Editor}></Route>
                <Route path="/scene-player/:scene_id" component={ScenePlayer}></Route>
                <Route path="/scenario-player/:scenario_id" component={ScenarioPlayer}></Route>
                <Route exact path="/project/:project_id" component={Project}></Route>
                <Route exact path="/projects"><Dashboard view={View.Project} /></Route>
                <Route exact path="/analytics"><Dashboard view={View.Analytics} /></Route>
                <Route exact path="/users"><Dashboard view={View.Users} /></Route>
                <Route exact path="/settings"><Settings /></Route>
                <Route component={PageNotFound} />
            </Switch>
        </BrowserRouter>:
        <BrowserRouter>
            <Switch>
                <Route path="/editor/:scene_id" component={Editor}></Route>
                <Route path="/scene-player/:scene_id" component={ScenePlayer}></Route>
                <Route component={Login} />
            </Switch>
        </BrowserRouter>
    );
};

export default AppRouter;
