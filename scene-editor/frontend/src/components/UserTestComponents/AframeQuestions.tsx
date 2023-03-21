import React, {useState} from "react";
import { Button, TextField, Select, MenuItem, Container, Grid, Checkbox } from '@mui/material';
import { UserTestComponentProps } from "./ComponentProps";

const AframeQuestions: React.FC<UserTestComponentProps> = ({onFinish, userInput, submit}) => {

    const [workedBaboon, setWorkedBaboon] = useState(userInput['workedBaboonAframe']);
    const [workedTopBottom, setWorkedTopBottom] = useState(userInput['workedTopBottom']);
    const [workedSideBySide, setWorkedSideBySide] = useState(userInput['workedSideBySide']);
    const [commentsText, setCommentsText] = useState(userInput['commentsAframe']);
    const [usedVr, setUsedVr] = useState(false);

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
            <Grid container alignItems="center" >
                <Grid xs={12} item={true} className="paper textBox">
                    <h2>Thank you for playing</h2>
                    Please answer some of the following questions regarding the experiment. If your answer to the question is yes, please check the box.
                </Grid>
                <Grid container item xs={12} alignItems="center" className="paper">
                    <Grid xs={11} item={true}>
                        Did you click the Enter VR button in the bottom right of the screen?
                    </Grid>
                    <Grid xs={1} item={true}>
                        {usedVr ? "Yes " : "No "}
                        <Checkbox checked={usedVr} onChange={(e) => setUsedVr(e.target.checked)} />
                    </Grid>
                </Grid>
                <Grid container item xs={12} alignItems="center" className="paper">
                    <Grid xs={12} md={6} item={true}>
                        <img src={`${process.env.PUBLIC_URL}/usertest-preview-images/baboon-preview${usedVr ? '-vr' : ''}.png`} alt="baboon-preview"/>
                    </Grid>
                    <Grid xs={11} item={true}>
                        Did you see the baboon and did your screen resemble the image above?
                    </Grid>
                    <Grid xs={1} item={true}>
                        {workedBaboon ? "Yes " : "No "}
                        <Checkbox checked={workedBaboon} onChange={(e) => setWorkedBaboon(e.target.checked)} />
                    </Grid>
                </Grid>
                <Grid container item xs={12} alignItems="center" className="paper">
                    <Grid xs={12} md={6} item={true}>
                        <img src={`${process.env.PUBLIC_URL}/usertest-preview-images/preview-topbottom${usedVr ? '-vr' : ''}.png`} alt="topbottom-preview"/>
                    </Grid>
                    <Grid xs={11} item={true}>
                        {!usedVr ? "In the second scene, was your whole screen orange and did it resemble the image above?" : "In the second scene, was the left screen orange, the right screen blue, and did your screen resemble the image above?"}
                    </Grid>
                    <Grid xs={1} item={true}>
                        {workedTopBottom ? "Yes " : "No "}
                        <Checkbox checked={workedTopBottom} onChange={(e) => setWorkedTopBottom(e.target.checked)} />
                    </Grid>
                </Grid>
                <Grid container item xs={12} alignItems="center" className="paper">
                    <Grid xs={12} md={6} item={true}>
                        <img src={`${process.env.PUBLIC_URL}/usertest-preview-images/preview-sidebyside${usedVr ? '-vr' : ''}.png`} alt="sidebyside-preview"/>
                    </Grid>
                    <Grid xs={11} item={true}>
                        {!usedVr ? "In the second scene, was your whole screen orange and did it resemble the image above?" : "In the second scene, was the left screen orange, the right screen blue, and did your screen resemble the image above?"}
                    </Grid>
                    <Grid xs={1} item={true}>
                        {workedSideBySide ? "Yes " : "No "}
                        <Checkbox checked={workedSideBySide} onChange={(e) => setWorkedSideBySide(e.target.checked)} />
                    </Grid>
                </Grid>
                <Grid xs={12} className="paper">
                    If one of the questions above was not marked or if you have other comments. Please comment below.
                    <br></br>
                    <TextField
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
                <Grid className="paper textBox" xs={12}>
                    <Button onClick={() => { submitInput(); } } color="primary" variant="contained">
                        Submit
                    </Button>
                </Grid>
            </Grid>
        </Container>
    );
};

export default AframeQuestions;