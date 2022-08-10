import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';

import { retrieveToken } from './actions/authActions'

import { View } from './types/views';

import PageNotFound from "./pages/PageNotFound/PageNotFound";
import Settings from "./pages/Settings/Settings";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import RegisterDone from "./pages/Auth/RegisterDone";
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
        <BrowserRouter basename={process.env.BASEPATH}>
            <Routes>
                <Route path="/scenario-editor/:projectID/:scenarioID" element={<ScenarioEditor/>}></Route>
                <Route path="/timeline-editor/:projectID/:timelineID" element={<TimelineEditor/>}></Route>
                <Route path="/editor/:project_id/:scene_id" element={<Editor/>}></Route>
                <Route path="/scene-player/:scene_id" element={<ScenePlayer/>}></Route>
                <Route path="/scenario-player/:scenario_id" element={<ScenarioPlayer/>}></Route>
                <Route path="/project/:project_id" element={<Project/>}></Route>
                <Route path="/projects" element={<Dashboard view={View.Project}/>}></Route>
                <Route path="/analytics" element={<Dashboard view={View.Analytics}/>}></Route>
                <Route path="/users" element={<Dashboard view={View.Users}/>}></Route>
                <Route path="/settings" element={<Settings/>}></Route>
                <Route path="*" element={<Navigate to="/projects" />} />
            </Routes>
        </BrowserRouter>:
        <BrowserRouter basename={process.env.BASEPATH}>
            <Routes>
                <Route path="/scene-player/:scene_id" element={<ScenePlayer/>}></Route>
                <Route path="/register" element={<Register/>}></Route>
                <Route path="/register-done" element={<RegisterDone/>}></Route>
                <Route path="*" element={<Login/>} />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRouter;
