import React, {useState} from "react";

import HomePage from "../../components/UserTestComponents/HomePage";
import EndPage from "../../components/UserTestComponents/EndPage";
import { UserTestComponentProps } from "../../components/UserTestComponents/ComponentProps";

const UserTest: React.FC = () => {
    interface UserInput {
        device: string,
        os: string,
        workedbaby: boolean,
        commentsbaby: string,
    }

    const testComponents: React.FC<UserTestComponentProps>[] = [
        HomePage,
        EndPage
    ];
    
    const [userInput, setUserInput] = useState<UserInput>({
        device: "",
        os: "",
        workedbaby: true,
        commentsbaby: ""
    });
    const [index, setIndex] = useState(0);
    
    let CurrentPage: React.FC<UserTestComponentProps> = testComponents[index];
    const toNextPage = () => {
        if(index < testComponents.length) {
            setIndex(index + 1);
            CurrentPage = testComponents[index];
            return;
        }
    }

    return <CurrentPage onFinish={toNextPage} userInput={userInput} setUserInput={setUserInput}/>;
};

export default UserTest;
