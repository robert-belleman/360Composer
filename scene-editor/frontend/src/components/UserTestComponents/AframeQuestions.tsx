import React, {useState} from "react";
import { Button, TextField, Select, MenuItem } from '@mui/material';
import { UserTestComponentProps } from "./ComponentProps";

const AframeQuestions: React.FC<UserTestComponentProps> = ({onFinish, userInput, submit}) => {

    const [workedBool, setWorkedBool] = useState(userInput['workedbaby']);
    const [commentsText, setCommentsText] = useState(userInput['commentsbaby']);
    
    const handleWorkedChange = (event: any) => {
        if (event.target.value === 1) {
            setWorkedBool(true);
        } else {
            setWorkedBool(false);
        }
    };

    const handleCommentsChange = (event: any) => {
        setCommentsText(event.target.value);
    };

    const submitInput = async () => {
        var newInput = userInput;
        newInput.workedAframe = workedBool;
        newInput.commentsAframe = commentsText;
        submit(newInput);
        onFinish();
    };

    return (
        <>
            <Select
                id="worked-baby-select"
                value={workedBool}
                label="Worked"
                onChange={handleWorkedChange}
            >
                <MenuItem value={1}>Yes</MenuItem>
                <MenuItem value={0}>No</MenuItem>
            </Select>
            <TextField
                autoFocus
                margin="dense"
                id="device"
                label="Device name"
                type="text"
                fullWidth
                value={commentsText}
                onChange={handleCommentsChange} 
            />
            <Button onClick={() => { submitInput(); } } color="primary">
                Submit
            </Button>
        </>
    );
};

export default AframeQuestions;