import React from 'react';
import { useParams } from "react-router-dom";
import ViewingAppController from '../../components/ViewingAppComponents/ViewingAppController';

const Player: React.FC = () => {
    const {type, id} = useParams<'type'|'id'>();
    
    switch (type) {
        case 'scenario':
            return <ViewingAppController scenarioId={id}/>
        case 'scene':
            return <ViewingAppController sceneId={id}/>
        case 'timeline':
            return <ViewingAppController timelineId={id}/>
        default:
            return null;
    }
};

export default Player;
