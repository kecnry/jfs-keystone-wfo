import { useState } from 'react';
import xlsx from 'node-xlsx';


import logo from './logo.svg';
import './App.css';


function App() {
  const [inputData, setInputData] = useState([]);
  const [showInputData, setShowInputData] = useState(false);
  const [outputData, setOutputData] = useState([]);
  const [showOutputData, setShowOutputData] = useState(false);

  function appendOutputData(outputData, empID, inDate, inTime, outTime, costCtr) {
    const totTimeMillisecs = new Date(inDate+' '+outTime) - new Date(inDate+' '+inTime)
    outputData.push({'empID': empID,
                     'inDate': inDate,
                     'inTime': inTime,
                     'outTime': outTime,
                     'totTime': Math.round(totTimeMillisecs/1000/60/60*100)/100,
                     'costCtr': costCtr})
    return outputData
  }

  function parseInput(e) {
    //console.log("parseInput...")
    const file = e.target.files[0];
    file.arrayBuffer().then((buffer) => {
      const inputData = xlsx.parse(buffer)[0].data
      // data is an ARRAY (spreadsheet rows, with each being an array containing a single string)
      //console.log(inputData)
      setInputData(inputData)

      var currCostCtr = null
      var currEmpID = null
      var currInDate = null
      var currInTime = null
      var currOutTime = null
      var rowSplit = []
      var prevRowSplit = []
      var outputData = []
      inputData.forEach((row, i) => {
        rowSplit = row[0].trimStart().split(' ').filter(v => v.length > 0)
        if (['JAVA', 'BATAVIA,', 'Department:', 'DEPT', 'TOTAL', 'REPORT'].indexOf(rowSplit[0]) !== -1) {
          // header/unused lines
          return
        }

        if (rowSplit[0].slice(1).startsWith('SVC')) {
          // beginning of a new employee
          if (currEmpID !== null) {
            // close out end-of-day of previous employee
            currOutTime = prevRowSplit[1]

            outputData = appendOutputData(outputData, currEmpID,
                                          currInDate, currInTime,
                                          currOutTime, currCostCtr)

            // start entry for this row
            currOutTime = null
          }
          currCostCtr = rowSplit[0]
          currEmpID = rowSplit[1]
          // cannot count from start since employees have variable number of spaces
          currInDate = rowSplit[rowSplit.length - 3]
          currInTime = rowSplit[rowSplit.length - 2]
          //console.log(currEmpID+': new employee')
          //console.log(rowSplit)
          return
        }

        if (currInDate !== null && rowSplit[0] !== currInDate) {
          // beginning of a new day, log last out time
          //console.log(currEmpID+' new date detected '+currInDate+' > '+rowSplit[0])
          currOutTime = prevRowSplit[1]

          outputData = appendOutputData(outputData, currEmpID,
                                        currInDate, currInTime,
                                        currOutTime, currCostCtr)

          // start entry for this row
          currInDate = rowSplit[0]
          currInTime = rowSplit[1]
          currOutTime = null
          return
        }

        // copy this row to access for next row
        prevRowSplit = rowSplit

        if (currInDate === null) {
          currInDate = rowSplit[1]
        }

        /// DEBUG
        if (false && currEmpID === 'AHH') {
          console.log(rowSplit)
        }
        //// END DEBUG

        if (rowSplit[2] == '50') {
          // out for lunch
          currOutTime = rowSplit[1]
          outputData = appendOutputData(outputData, currEmpID,
                                        currInDate, currInTime,
                                        currOutTime, currCostCtr)

          currInTime = null
          currOutTime = null
          return
        }
        if (currInTime === null) {
          currInTime = rowSplit[1]
        }
      })
      //console.log(outputData)
      setOutputData(outputData)
    })
  }
  function toggleShowInputData() {
    setShowInputData(!showInputData)
  }
  function toggleShowOutputData() {
    setShowOutputData(!showOutputData)
  }
  return (
    <div className="App">
      <input
        type="file"
        onInput={(e) => parseInput(e)}
      />
      <div>
        <button type="button" onClick={toggleShowInputData}>
          Input Data: {inputData.length} rows
        </button>
        <div style={{textAlign: 'left', display: showInputData ? 'block' : 'none'}}>
          {inputData.map((row) => {return (<div>{row}</div>)})}
        </div>
      </div>

      <div>
        <button type="button" onClick={toggleShowOutputData}>
          Output Data: {outputData.length} rows
        </button>
        <div style={{textAlign: 'left', display: showOutputData ? 'block' : 'none'}}>
          <div>Employee Id,Pay Date,In Date,Time In,Time Out,Total Time,Time Off,Cost Center2,Note</div>
          {outputData.map((dict) => {return (<div>{dict.empID},???,{dict.inDate},{dict.inTime},{dict.outTime},{dict.totTime},???,{dict.costCtr},imported from Keystone</div>)})}
        </div>
      </div>
    </div>
  );
}

export default App;
