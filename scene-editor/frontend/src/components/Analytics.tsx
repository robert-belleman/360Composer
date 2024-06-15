import React, {useState} from 'react'

import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box';

import GetAppIcon from '@mui/icons-material/GetApp';

const Analytics = () => {
  const [days, setDays] = useState(30)

  return (
    <Box sx={{ flexGrow: 1, p: 2 }}>
      <Grid container>
        <Grid item xs={12}>
          <TextField
            id="standard-number"
            label="Days"
            type="number"
            value={days}
            onChange={(event:any) => setDays(event.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            helperText="Specifies the last x days to be included in the export"
          />
        </Grid>
        <Grid item xs={12} sx={{ mt: 2 }}>
          <Button startIcon={<GetAppIcon />} variant="contained" color="primary" href={`/api/analytics/legacy/export?days=${days}`}>
            Export to CSV
          </Button>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Analytics