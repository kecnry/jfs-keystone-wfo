import { useState } from 'react';
import xlsx from 'node-xlsx';


import logo from './logo.svg';
import './App.css';


function App() {
  const [rows, setRows] = useState(0);

  function parseInput(e) {
    console.log("parseInput...")
    const file = e.target.files[0];
    file.arrayBuffer().then((buffer) => {
      const data = xlsx.parse(buffer)[0].data
      // data is an ARRAY (spreadsheet rows, with each being an array containing a single string)
      console.log(data)
      setRows(data.length)
    })
  }
  return (
    <div className="App">
      <input
        type="file"
        onInput={(e) => parseInput(e)}
      />
      <p>
        Read {rows} rows of data
      </p>
    </div>
  );
}

export default App;
