import React, { useContext, useEffect, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
// import { javascript } from '@codemirror/lang-javascript';
import { EditorView, basicSetup } from '@codemirror/basic-setup';
/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import {
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardMedia,
  Container,
  Grid,
  Typography,
  Box,
} from '@mui/material';
import Layout from '../../components/layout';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import {
  addcodepracticeproblembyid,
  getpracticeproblembyid,
} from '../../Utils/features/practiceproblemideSlice';
import { AuthContext } from '../../firebase/auth';
const Loader = () => <div className="loader"></div>;

const IdePythoncompiler = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { singlepracticeproblem, loadings } = useSelector(
    (state) => state.singlepracticeproblem
  );
  const problemid = router.query.problemid;
  const [loading, setloading] = useState(false);
  const [code, setCode] = useState(singlepracticeproblem?.code);
  const [codeoutput, setCodeoutput] = useState(singlepracticeproblem?.output);
  const [codeinput, setCodeinput] = useState('');
  const [lang, setlang] = useState();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (!problemid || !user) {
      return;
    }
    waiting();
  }, [problemid, user]);

  const waiting = async () => {
    const userid = user?.uid;
    const res = await dispatch(getpracticeproblembyid({ problemid, userid }));

    if (res) {
      console.log(res);
      console.log(res.payload.output);
      console.log(res.payload.code);
      setCodeoutput(res.payload.output);
      setCode(res.payload.code);
    }
  };

  const checkCodeStatus = () => {
    const userid = user?.uid;
    console.log(code);
    console.log(codeoutput);
    if (code && codeoutput) {
      dispatch(
        addcodepracticeproblembyid({ problemid, userid, code, codeoutput })
      );
    }
  };

  const checkCode = async () => {
    setloading(true);
    console.log(code);
    const res = await axios.post(
      '/execute',
      {
        script: code,
        stdin: codeinput,
        language: 'python3',
        versionIndex: '3',
        clientId: 'e57c2d9bafc4964c61f72f765d3aab99',
        clientSecret:
          '7bbd212eb3a1a67f60e3c4b5a60d379690087249a39f3bbe87f83928143c8250',
      },
      {
        headers: {
          'content-type': 'application/json',
        },
      }
    );
    setloading(false);
    console.log(res);
    console.log(res.data);
    console.log(res.data.output);
    setCodeoutput(res.data.output);
  };
  return (
    <Layout>
      {loading && <Loader />}
      <Grid
        container
        component="main"
        sx={{
          mt: 5,
        }}
      >
        {loadings ? (
          <>
            <Loader />
          </>
        ) : (
          <></>
        )}
        <Container maxWidth="lg" sx={{ mb: 3 }}>
          <Typography variant="h6" display="inline" sx={{ mt: 1 }}>
            Question : {''}
          </Typography>

          <Typography
            variant="h6"
            sx={{ fontWeight: 'light' }}
            display="inline"
          >
            {singlepracticeproblem.question}
          </Typography>

          <Box sx={{ mt: 3, border: '8px solid white', borderRadius: '10px' }}>
            <CodeMirror
              value={code}
              minHeight="250px"
              maxHeight="360px"
              extensions={[basicSetup, python()]}
              theme="dark"
              autoFocus="true"
              placeholder="write your code here"
              onChange={(value, viewUpdate) => {
                setCode(value);
              }}
            />
          </Box>

          <Typography variant="h6" sx={{ mt: 3, mb: 3 }}>
            Input if any :
          </Typography>
          <Box sx={{ border: '2px solid black' }}>
            <CodeMirror
              value={codeinput}
              height="80px"
              theme="light"
              onChange={(value, viewUpdate) => {
                setCodeinput(value);
              }}
            />
          </Box>
          <Box textAlign="center" sx={{ mt: 3 }}>
            <Button variant="contained" onClick={() => checkCode()}>
              <PlayArrowIcon /> Execute
            </Button>
            <Button
              sx={{ ml: 3 }}
              variant="contained"
              onClick={() => checkCodeStatus()}
            >
              Submit and Save
            </Button>
          </Box>
          <Typography variant="h5" sx={{ mt: 3, mb: 1 }}>
            Output
          </Typography>
          <CodeMirror
            value={codeoutput}
            contentEditable="false"
            height="200px"
            theme="dark"
          />
        </Container>
      </Grid>
    </Layout>
  );
};

export default IdePythoncompiler;