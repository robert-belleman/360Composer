import React, {useState} from "react";
import { Button, TextField, Select, MenuItem, Container, Grid, Checkbox } from '@mui/material';
import { UserTestComponentProps } from "./ComponentProps";

const AframeQuestions: React.FC<UserTestComponentProps> = ({onFinish, userInput, submit}) => {

    const [workedBaboon, setWorkedBaboon] = useState(userInput['workedBaboonAframe']);
    const [workedTopBottom, setWorkedTopBottom] = useState(userInput['workedTopBottom']);
    const [workedSideBySide, setWorkedSideBySide] = useState(userInput['workedSideBySide']);
    const [commentsText, setCommentsText] = useState(userInput['commentsAframe']);

    const handleCommentsChange = (event: any) => {
        setCommentsText(event.target.value);
    };

    const submitInput = async () => {
        var newInput = userInput;
        newInput.workedBaboonAframe = workedBaboon;
        newInput.workedTopBottom = workedTopBottom;
        newInput.workedSideBySide = workedSideBySide;
        newInput.commentsAframe = commentsText;
        submit(newInput);
        onFinish();
    };

    return (
        <Container>
            <Grid container spacing={2}>
                <Grid xs={12} item={true}>
                    <h2>Thank you for playing</h2>
                </Grid>
                <Grid xs={12} item={true}>
                    Please answer some of the following questions regarding the experiment:
                </Grid>
                <Grid xs={6} item={true}>
                    Did you see the baboon in scene 1?
                </Grid>
                <Grid xs={6} item={true}>
                    <Checkbox checked={workedBaboon} onChange={(e) => setWorkedBaboon(e.target.checked)} />
                </Grid>
                <Grid xs={6} item={true}>
                    Was the whole screen orange in scene 2?
                </Grid>
                <Grid xs={6} item={true}>
                    <Checkbox checked={workedTopBottom} onChange={(e) => setWorkedTopBottom(e.target.checked)} />
                </Grid>
                <Grid xs={6} item={true}>
                    Was the whole screen orange in scene 3?
                </Grid>
                <Grid xs={6} item={true}>
                    <Checkbox checked={workedSideBySide} onChange={(e) => setWorkedSideBySide(e.target.checked)} />
                </Grid>
                <Grid xs={12} item={true}>
                    If one of the questions above was not marked. Please comment below on what happened.
                </Grid>
                <Grid xs={6} item={true}>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="comments"
                        label="Comments"
                        type="text"
                        fullWidth
                        value={commentsText}
                        maxRows={5}
                        minRows={5}
                        multiline
                        onChange={(e) => setCommentsText(e.target.value)}
                    />
                </Grid>
                <Grid xs={12} item={true}>
                    <Button onClick={() => { submitInput(); } } color="primary">
                        Submit
                    </Button>
                </Grid>

            </Grid>
        </Container>
    );
};

export default AframeQuestions;