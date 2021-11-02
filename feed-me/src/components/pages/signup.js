import React, { useState } from 'react'
import Axios from 'axios'
import {
    Grid,
    Paper,
    Avatar,
    Typography,
    TextField,
    Button,
    FormControlLabel,
    Checkbox
} from '@material-ui/core'
import AddCircleOutlineOutlinedIcon from '@material-ui/icons/AddCircleOutlineOutlined';
import { makeStyles } from '@material-ui/core/styles';
import './signup.css'

const useStyles = makeStyles((theme) => ({
    formControl: {
        padding: 10,
        margin: 15,
        minWidth: 120,
        align: 'left'
    },
    selectEmpty: {
        marginTop: theme.spacing(2),
    },
}));
const SignUp = () => {

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    Axios.defaults.withCredentials = true;

    const handleSignUp = (e) => {
        e.preventDefault();

        if(name && email && password){
            console.log(name,email,password);
            Axios.post('http://localhost:3001/api/savePerson', {
            name: name,
            email: email,
            password: password
        }).then(() => {
            alert('success insert');
          })
        }
    }

    // const classes = useStyles();
    const handleChange = (event) => {
        const name = event.target.name;
        setState({
            ...state,
            [name]: event.target.value,
        });
    };
    const [state, setState] = React.useState({
    });

    const hStyle = {
        margin: 0,
        fontFamily: 'Montserrat',
        fontSize: '2rem'
    }
    const avatarStyle = {
        backgroundColor: 'transparent',
        margin: '5px 0'
    }
    const iconStyle = {
        fontSize: '4rem',
        color: 'pink'
    }
    const controlStyle = {
        color: 'secondary',
        fontSize: '0.5rem'
    }
    const btnStyle = {
        align: 'center'
    }
    return (
        <div className="form-signup">
            <Grid>
                <Paper className="paperStyle">
                    <Grid align="center">
                        <Avatar style={avatarStyle} >
                            <AddCircleOutlineOutlinedIcon style={iconStyle} />
                        </Avatar>
                        <h3 style={hStyle}>Sign Up</h3>
                    </Grid>
                    <form noValidate autoComplete="off" onSubmit={handleSignUp} className="form-design">
                        <TextField onChange={(e) => setName(e.target.value)} color="secondary" label="Username"
                            placeholder="Enter your full name"
                            type="text" fullWidth
                            required />
                        <TextField onChange={(e) => setEmail(e.target.value)} color="secondary" label="E-mail"
                            placeholder="Enter your e-mail"
                            type="email" fullWidth
                            required />
                        <TextField onChange={(e) => setPassword(e.target.value)} color="secondary" label="Password"
                            placeholder="Enter password" fullWidth
                            type="password"
                            required />
                        <TextField color="secondary" label="Confirm password"
                            placeholder="Confirm your password" fullWidth
                            type="password"
                            required />
                        <FormControlLabel
                            control=
                            {<Checkbox style={controlStyle}
                                name="checkedC" />
                            }
                            label="I accept the terms and conditions" align="left" />
                        <Button
                            style={btnStyle}
                            type="submit"
                            variant="contained" size="medium"
                            color="primary"
                            fullWidth>Sign Up</Button>
                    </form>
                </Paper>
            </Grid>
        </div>
    )
}
export default SignUp;