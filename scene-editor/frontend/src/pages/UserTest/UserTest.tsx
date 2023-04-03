import React, {useEffect, useState} from "react";
import axios from 'axios';

import HomePage from "../../components/UserTestComponents/HomePage";
import EndPage from "../../components/UserTestComponents/EndPage";
import { UserTestComponentProps } from "../../components/UserTestComponents/ComponentProps";
import AframeTest from "../../components/UserTestComponents/AframeTest";
import AframeQuestions from "../../components/UserTestComponents/AframeQuestions";
import { useDispatch, useSelector } from "react-redux";
import { logInCustomer } from "../../actions/authActions";
import { useNavigate, useParams } from "react-router-dom";
import { browserName, 
         browserVersion,
         osName,
         osVersion,
         mobileVendor,
         mobileModel
} from 'react-device-detect';
import { max } from "lodash";

const UserTest: React.FC = () => {
    const token = useSelector((state:any) => state.token);
    const dispatch = useDispatch()
    const [submitted, setSubmitted] = useState(false);
    const {pageID} = useParams<'pageID'>();
    const navigate = useNavigate();
    
    // All input values for the user to change.
    interface UserInput {
        device: string,
        browser: string,
        hmd: string,
        enteredVr: boolean,
        workedBaboonAframe: boolean,
        workedTopBottom: boolean,
        workedSideBySide: boolean
        commentsAframe: string,
        detectedBrowserName: string,
        detectedBrowserVersion: string,
        detectedOsName: string,
        detectedOsVersion: string,
        detectedMobileVendor: string,
        detectedMobileModel: string
    }

    // Array which contains all components that are needed in the test in chronological order.
    const testComponents: React.FC<UserTestComponentProps>[] = [
        HomePage,
        AframeTest,
        AframeQuestions,
        EndPage
    ];
    
    const [userInput, setUserInput] = useState<UserInput>({
        device: "",
        browser: "",
        hmd: "",
        enteredVr: false,
        workedBaboonAframe: false,
        workedTopBottom: false,
        workedSideBySide: false,
        commentsAframe: "",
        detectedBrowserName: browserName,
        detectedBrowserVersion: browserVersion,
        detectedOsName: osName,
        detectedOsVersion: osVersion,
        detectedMobileVendor: mobileVendor,
        detectedMobileModel: mobileModel
    });
    const [index, setIndex] = useState(pageID && parseInt(pageID) < testComponents.length ? parseInt(pageID) : 0);

    const handleSubmit = (input : UserInput) => {
        setUserInput(input);
    };

    // TODO: Make login dynamic
    // Logs in the preset customer.
    useEffect(() => {
        if (!(token.id !== "" && token.id !== null && token.role === 'customer')) {
            dispatch(logInCustomer('3bf6ce57-2c91-4adf-a6bc-b7c48442ecd5', 'test'));
        }
    }, [token, dispatch]);

    // Navigate to updated index
    useEffect(() => {
        navigate(`/usertest/${index}`)
        CurrentPage = testComponents[index];
    }, [index]);

    // Post userInput to database
    useEffect(() => {
        if (submitted) {
            console.log(userInput)
            axios.post(`/api/usertest/post`, userInput)
                    .catch(e => console.log(e));
        }
    }, [submitted, userInput]);

    // On back action, return to previous page.
    useEffect(() => {
        window.addEventListener('popstate', (event) => {
            const newIndex = max([index - 1, 0]);
            setIndex(newIndex ? newIndex : 0);
            navigate(`/usertest/${newIndex}`)
            return true;
        });
    }, []);

    const toNextPage = () => {
        // If at end repeat
        if (index + 1 === testComponents.length) { 
            setUserInput({
                device: "",
                browser: "",
                hmd: "",
                enteredVr: false,
                workedBaboonAframe: false,
                workedTopBottom: false,
                workedSideBySide: false,
                commentsAframe: "",
                detectedBrowserName: browserName,
                detectedBrowserVersion: browserVersion,
                detectedOsName: osName,
                detectedOsVersion: osVersion,
                detectedMobileVendor: mobileVendor,
                detectedMobileModel: mobileModel
            })
            setIndex(0);
            navigate(`/usertest/0`)
            return true;
        }

        // If going to end page, submit anwsers
        if (index + 1 === testComponents.length - 1) { 
            setSubmitted(true);
        }

        // To next page
        if(index + 1 < testComponents.length) {
            setIndex(index + 1);
            navigate(`/usertest/${index + 1}`)
            return true;
        }
    }

    // Skips to folliwing component.
    const skipPage = () => {
        if(index + 2 < testComponents.length) {
            console.log("SKIP PAGE")
            setIndex(index + 2);
            navigate(`/usertest/${index+2}`)
            return true;
        }
    }

    let CurrentPage: React.FC<UserTestComponentProps> = testComponents[index];
    return <CurrentPage onFinish={toNextPage} userInput={userInput} submit={handleSubmit} active={true} skip={skipPage}/>;
};

export default UserTest;
