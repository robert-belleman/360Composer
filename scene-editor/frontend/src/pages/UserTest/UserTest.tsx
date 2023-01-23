import React, {useState} from "react";
import axios from 'axios';

import HomePage from "../../components/UserTestComponents/HomePage";
import EndPage from "../../components/UserTestComponents/EndPage";
import { UserTestComponentProps } from "../../components/UserTestComponents/ComponentProps";
import AframeTest from "../../components/UserTestComponents/AframeTest";
import BabylonTest from "../../components/UserTestComponents/BabylonTest";
import BabylonQuestions from "../../components/UserTestComponents/BabylonQuestions";
import AframeQuestions from "../../components/UserTestComponents/AframeQuestions";

const UserTest: React.FC = () => {
    interface UserInput {
        device: string,
        os: string,
        workedbaby: boolean,
        commentsbaby: string,
        workedAframe: boolean,
        commentsAframe: string
    }

    const testComponents: React.FC<UserTestComponentProps>[] = [
        HomePage,
        BabylonTest,
        BabylonQuestions,
        AframeTest,
        AframeQuestions,
        EndPage
    ];
    
    const [userInput, setUserInput] = useState<UserInput>({
        device: "",
        os: "",
        workedbaby: true,
        commentsbaby: "",
        workedAframe: true,
        commentsAframe: ""
    });
    const [index, setIndex] = useState(0);

    const handleSubmit = (input : UserInput) => {
        setUserInput(input);
    }
    
    let CurrentPage: React.FC<UserTestComponentProps> = testComponents[index];
    const toNextPage = () => {
        if(index + 1 < testComponents.length) {
            console.log("TONEXTPAGE")
            setIndex(index + 1);
            CurrentPage = testComponents[index];
            return true;
        } else {
            axios.post(`/api/usertest/post`, userInput)
                .catch(e => console.log(e));
            return false;
        }
    }

    return <CurrentPage onFinish={toNextPage} userInput={userInput} submit={handleSubmit} active={true}/>;
};

export default UserTest;
