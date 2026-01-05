/*  PlayerCustomer contains the landing page of a customer in which the customer must login
*   to view the viewing application.
*/
import React, { useEffect, useState } from 'react';
import { useParams } from "react-router-dom";
import { Button, Container, Grid, TextField } from '@mui/material';
import ViewingAppController from '../../components/ViewingAppComponents/ViewingAppController';
import { api } from '../../util/api';

import { getMicRights } from '../../components/EditorComponents/recording';

const INITIAL_TIMELINE = {
    id: "",
    project_id: "",
    start: "",
    randomized: true,
    name: "",
    description: "",
    created_at: "",
    updated_at: ""
};

const PlayerCustomer: React.FC = () => {
    const {timelineID, uuID} = useParams<'timelineID'|'uuID'>();
    const [loggedIn, setLoggedIn] = useState(false);
    const [offlinePlay, setOfflinePlay] = useState(false);
    const [begunTimeline, setBegunTimeline] = useState(false);
    const [code, setCode] = useState("");
    const [timeline, setTimeline] = useState(INITIAL_TIMELINE);
    const [loadingTimeline, setLoadingTimeline] = useState(true);

    const fetchTimeline = () => api.get(`/api/timeline/${timelineID}/`)
        .then((res:any) => {setTimeline(res.data);})
        .then(() => setLoadingTimeline(false))
        .catch((e:any) => console.log('error while fetching data', e));

    const login = (id: any, code: string) => {getMicRights(); api.post(`/api/user/customer-login`, {id, access_code: code})
        .catch(e => console.log('error login in', e))
        .then(res => {setLoggedIn(true); fetchTimeline();});}

    const handleCodeChange = (event: any) => {
        setCode(event.target.value);
    };

    const handleSubmit = () => {
        if (code && uuID) {
            login(uuID, code);
        }
    };

    const handleStart = () => {
        setOfflinePlay(false);
        setBegunTimeline(true);
    };

    const handleStartOffline = () => {
        setOfflinePlay(true);
        setBegunTimeline(true);
    };

    const downloadTimeline = () => {
        api.get(`/api/timeline/${timelineID}/export?cache=true&refresh=true`)
            .then((res:any) => {
                setTimeline(res.data[0]);
                for (const timelineScenario of res.data[0].scenarios) {
                    for (const timelineScenarioScene of timelineScenario.scenes) {
                        api.get(`/api/asset/${timelineScenarioScene.video}?cache=true&refresh=true`)
                            .then((res: any) => {
                                api.get(`/assets/${res.data.path}?cache=true&refresh=true`)
                                    .then((res: any) => {
                                    })
                                    .catch((e:any) => console.log('Something went wrong while fetching video:', e));
                            })
                            .catch((e:any) => console.log('Something went wrong while fetching video:', e));
                    }
                }
            })
            .catch((e:any) => console.log('Something went wrong while fetching timeline:', e));
    };

    return loggedIn ?
        (begunTimeline ?
            (<ViewingAppController timelineId={timelineID} offline={offlinePlay}/>
            ) : (
            <Container>
                <Grid container spacing={2}>
                    <Grid className='player-title' xs={8} item={true} >
                        <h1>360COMPOSER</h1>
                    </Grid>
                    <Grid xs={12} item={true}>
                        <h2>You are logged in. Start the experience or download the files for offline use first below.</h2>
                    </Grid>
                    <Grid xs={4} item={true}>
                        <Button onClick={handleStart} color="primary">
                            Start
                        </Button>
                    </Grid>
                    <Grid xs={4} item={true}>
                        <Button onClick={handleStartOffline} color="primary">
                            Start Offline
                        </Button>
                    </Grid>
                    <Grid>
                        <Button onClick={downloadTimeline} color="primary">
                            Download offline-use files
                        </Button>
                    </Grid>
                </Grid>
            </Container>)
        ) : (
        <Container>
            <Grid container spacing={2}>
                <Grid className='player-title' xs={8} item={true} >
                    <h1>360COMPOSER</h1>
                </Grid>
                <Grid xs={12} item={true}>
                    <h2>Welcome to 360Composer. Please enter your user code to start.</h2>
                </Grid>
                <Grid xs={8} item={true}>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="Code"
                        label="User Code"
                        type="text"
                        fullWidth
                        value={code}
                        onChange={handleCodeChange}
                    />
                </Grid>
                <Grid xs={4} item={true}>
                    <Button onClick={handleSubmit} color="primary">
                        Submit
                    </Button>
                </Grid>
            </Grid>
        </Container>
    );
};

export default PlayerCustomer;
