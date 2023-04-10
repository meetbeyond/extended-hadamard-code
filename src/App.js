import React, { useState } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Form, Row, Col, Button, Badge } from 'react-bootstrap';
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';

function App() {
  const [val, setVal] = useState("")
  const [m, setM] = useState([])
  const [G, setG] = useState([])
  const [c, setC] = useState("")
  const [show, setShow] = useState(false)
  const [warn, setWarn] = useState(0)

  const handleChange = e => {
    let filteredVal = '';
    for (let i = 0; i < e.target.value.length; ++i)
      if (e.target.value[i] === '0' || e.target.value[i] === '1')
        filteredVal += e.target.value[i];
      
    if(filteredVal.length > 10) {
      setWarn(2)
      setTimeout(() => setWarn(0), 2000)
    }

    setVal(filteredVal.slice(0, 10));
    if (filteredVal.length !== e.target.value.length) {
      setWarn(1);
      setTimeout(() => setWarn(0), 2000);
    }
  }

  const encode = () => {
    const r = val.length - 1, n = 2 ** r, k = r + 1
    const msg = val.split('').map(ch => parseInt(ch))
    const Gen = new Array(k).fill(0).map(() => new Array(n).fill(0))
    const codeword = new Array(n).fill(0)

    for (let num = 2 ** r, col = 0; num < 2 ** (r + 1); ++num, ++col)
      for (let bit = k - 1, row = 0; bit >= 0; --bit, ++row)
        Gen[row][col] = (num >> bit) & 1

    for (let cid = 0; cid < n; ++cid)
      for (let mid = 0; mid < k; ++mid)
        codeword[cid] ^= msg[mid] & Gen[mid][cid]

    setM(msg)
    setG(Gen)
    setC(codeword)
    setShow(true)
  }

  const getLatex = mat => {
    let tex = "\\begin{bmatrix}"

    if (mat[0] === 0 || mat[0] === 1)
      tex += mat.join('&')
    else {
      for (let row = 0; row < mat.length; ++row) {
        tex += mat[row].join('&')
        if (row !== mat.length - 1)
          tex += "\\\\"
      }
    }

    tex += "\\end{bmatrix}"
    return tex
  }

  const getFirstEntry = () => {
    let tex = ""
    for (let mid = 0; mid < m.length; ++mid) {
      tex += m[mid].toString() + "\\cdot" + G[mid][0]
      if (mid !== m.length - 1)
        tex += "\\oplus"
    }
    return tex + "=" + c[0].toString()
  }

  return (
    <div className="App">
      <h2 className='text-center mt-2'>Extended Hadamard Encoder</h2>
      <hr style={{ borderTop: '2px solid black' }} />
      <Form className='px-5 pt-3'>
        <Form.Group as={Row}>
          <Form.Label column sm='2' style={{ fontSize: 'large', marginRight: '-70px' }}><InlineMath math='m' /> (binary message):</Form.Label>
          <Col sm='4'>
            <div>
              <Form.Control type='text' value={val} onChange={handleChange} />
              {warn === 1 && <div className='mb-1' style={{ color: 'red' }}>Only binary message is allowed!</div>}
              {warn === 2 && <div className='mb-1' style={{ color: 'red' }}>Input too large to encode!</div>}
            </div>
          </Col>
        </Form.Group>
        <Form.Group as={Row}>
          <Form.Label column sm='2' style={{ fontSize: 'large', marginRight: '-70px' }}><InlineMath math='n' /> (codeword length):</Form.Label>
          <Col sm='4'><Form.Control type='text' disabled placeholder={val.length ? 2 ** (val.length - 1) : 0} /></Col>
        </Form.Group>
        <Form.Group as={Row}>
          <Form.Label column sm='2' style={{ fontSize: 'large', marginRight: '-70px' }}><InlineMath math='k' /> (message length):</Form.Label>
          <Col sm='4'><Form.Control type='text' disabled placeholder={val.length} /></Col>
        </Form.Group>
        <Form.Group as={Row}>
          <Form.Label column sm='2' style={{ fontSize: 'large', marginRight: '-70px' }}><InlineMath math='d' /> (distance):</Form.Label>
          <Col sm='4'><Form.Control type='text' disabled placeholder={val.length > 1 ? 2 ** (val.length - 2) : 0} /></Col>
        </Form.Group>
      </Form>
      <Button disabled={val.length === 0} className='ms-5 mt-2 mb-2' onClick={encode}>Encode</Button>
      {show && <div className='mx-5 pt-3'>
        <h4>Result</h4>
        <hr style={{ borderTop: '2px solid black' }} />
        <Form>
          <Form.Group as={Row}>
            <Form.Label column sm='2' style={{ fontSize: 'large', marginRight: '-70px' }}><InlineMath math='c' /> (codeword):</Form.Label>
            <Col><Form.Control type='text' disabled style={{ overflow: 'scroll', width: `${Math.max(c.length * 10, 460)}px` }} placeholder={c.join('')} /></Col>
          </Form.Group>
        </Form>
      </div>}
      {show && <div className='mx-5 mt-2'>
        <div>
          <InlineMath math={`m=${getLatex(m)}`} />
        </div>
        <div className='d-flex'>
          <BlockMath math={`G=${getLatex(G)}`} />
        </div>
        <div style={{marginTop: '-15px'}} className='d-flex'>
          <BlockMath math={`c=m \\times G =${getLatex(c)}`} />
        </div>
      </div>}
      {show && <div className='mx-5 mt-4 mb-3'>
        <h4>Steps</h4>
        <hr style={{ borderTop: '2px solid black' }} />
        <div style={{ fontWeight: '600' }}>Step 1: Calculating <InlineMath math='n' />, <InlineMath math='k' /> and <InlineMath math='d' /> from the given message</div>
        <div className='mx-5'>
          <div>Message <InlineMath math={`m=${m.join('')}`} /></div>
          <div><InlineMath math={`\\Rightarrow k=${m.length}`} /></div>
          <div>General form of Extended Hadamard code is <InlineMath math="(2^r,r+1,2^{r-1})" /></div>
          <div><InlineMath math={`\\Rightarrow r=${m.length - 1}`} /></div>
          <div><InlineMath math={`\\Rightarrow n=2^r=${c.length}`} /></div>
          <div><InlineMath math={`\\Rightarrow d=2^{r-1}=${Math.floor(c.length / 2)}`} /></div>
        </div>
        <div className='mt-3' style={{ fontWeight: '600' }}>Step 2: Creating generator matrix <InlineMath math='G' /></div>
        <div className='mx-5'>
          <div>To create the generator matrix of Extended Hadamard code <InlineMath math="(2^r,r+1,2^{r-1})" />, we need to remove all <InlineMath math="2^{r-1}" /> columns with first entry being <InlineMath math="0" /> from the generator matrix of Hadamard code <InlineMath math="(2^{r+1}-1,r+1,2^r)." /></div>
          <div>The generator matrix of Hadamard code <InlineMath math="(2^{r+1}-1,r+1,2^r)" /> will have binary representation of numbers from <InlineMath math="1" /> to <InlineMath math="2^{r+1}-1" /> as columns. Out of these columns, the columns corresponding to numbers from <InlineMath math="1" /> to <InlineMath math="2^r-1" /> will have first entry <InlineMath math="0." /> If we remove these columns, we will get the generator matrix of Extended Hadamard code <InlineMath math="(2^r,r+1,2^{r-1}):" /> </div>
          <div className='d-flex'>
            <BlockMath math={`G=${getLatex(G)}`} />
          </div>
        </div>
        <div className='mt-3' style={{ fontWeight: '600' }}>Step 3: Encode the message by multipying it with the generator matrix</div>
        <div className='mx-5'>
          <div><InlineMath math='c=m \times G' /></div>
          <div className='d-flex'><BlockMath math={`\\Rightarrow c=${getLatex(m)} \\times ${getLatex(G)}`} /></div>
          <div>First entry of <InlineMath math={`c=${getFirstEntry()}`} /> </div>
          <div className='mt-1'>Similarly, we get:</div>
          <div className='d-flex'><BlockMath math={`c=${getLatex(c)}`} /></div>
        </div>
      </div>}
      <hr style={{ borderTop: '2px solid black' }} />
      <div className='ms-5 mb-3 d-flex flex-column'>
        <Badge style={{width: '200px'}} bg="secondary">Made by -</Badge>
        <Badge style={{width: '200px'}} className='mt-1'>Kunjan Gevariya - 1903116</Badge>
        <Badge style={{width: '200px'}} className='mt-1'>Meet Patel - 1903129</Badge>
      </div>
    </div>
  );
}

export default App;
