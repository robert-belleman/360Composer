import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';

import { retrieveToken } from './actions/authActions'

import { View } from './types/views';

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
import ViewingAppTest from "./pages/ViewingAppTest/ViewingAppTest";
import PlayerCustomer from "./pages/Player/PlayerCustomer";
import Player from "./pages/Player/Player";

const AppRouter: React.FC = () => {
    // TODO: routes should be protected in the future
    const token = useSelector((state:any) => state.token)
    const hasUserToken = () => token.id !== "" && token.id !== null && token.role === 'user';
    const hasCustomerToken = () => token.id !== "" && token.id !== null && token.role === 'customer';
    const dispatch = useDispatch();

    useEffect(() => {
        if (!hasUserToken() && !hasCustomerToken()) {
            dispatch(retrieveToken())
        }
    }, [])

    return (
        hasUserToken() ?
        <BrowserRouter basename={process.env.BASEPATH}>
            <Routes>
                <Route path="/app/scenario-editor/:projectID/:scenarioID" element={<ScenarioEditor/>}></Route>
                <Route path="/app/timeline-editor/:projectID/:timelineID" element={<TimelineEditor/>}></Route>
                <Route path="/app/editor/:project_id/:scene_id" element={<Editor/>}></Route>
                <Route path="/app/scene-player/:scene_id" element={<ScenePlayer/>}></Route>
                <Route path="/app/scenario-player/:scenario_id" element={<ScenarioPlayer/>}></Route>
                <Route path="/app/project/:project_id" element={<Project/>}></Route>
                <Route path="/app/projects" element={<Dashboard view={View.Project}/>}></Route>
                <Route path="/app/analytics" element={<Dashboard view={View.Analytics}/>}></Route>
                <Route path="/app/users" element={<Dashboard view={View.Users}/>}></Route>
                <Route path="/app/settings" element={<Settings/>}></Route>
                <Route path="/app/test" element={<ViewingAppTest/>}/>
                <Route path="/app/*" element={<Navigate to="/app/projects" />} />
                <Route path="/player/:timelineID/:uuID" element={<PlayerCustomer/>} />
                <Route path="/app/preview-player/:type/:id" element={<Player/>} />                
            </Routes>
        </BrowserRouter>: 
            hasCustomerToken() ?
            <BrowserRouter basename={process.env.BASEPATH}>
                <Routes>
                    <Route path="/player/:timelineID/:uuID" element={<PlayerCustomer/>} />
                    <Route path="/app/*" element={<Login/>} />
                </Routes>
            </BrowserRouter>
            :
            <BrowserRouter basename={process.env.BASEPATH}>
                <Routes>
                    <Route path="/app/register" element={<Register/>}></Route>
                    <Route path="/app/register-done" element={<RegisterDone/>}></Route>
                    <Route path="/app/*" element={<Login/>} />
                    <Route path="/player/:timelineID/:uuID" element={<PlayerCustomer/>} />
                </Routes>
            </BrowserRouter>
    );
};

export default AppRouter;
