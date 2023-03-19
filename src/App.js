import { useState, useCallback } from 'react';
import {useDropzone} from 'react-dropzone';
import xlsx from 'node-xlsx';


import logo from './logo.svg';
import './App.css';


function App() {
  const onDrop = useCallback((acceptedFiles) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader()

      reader.onabort = () => console.log('file reading was aborted')
      reader.onerror = () => console.log('file reading has failed')
      reader.onload = () => {
      // Do whatever you want with the file contents
        parseInput(reader.result)
      }
      reader.readAsArrayBuffer(file)
    })

  }, [])

  const {acceptedFiles, getRootProps, getInputProps} = useDropzone({onDrop});

  const files = acceptedFiles.map(file => (
    <li key={file.path}>
      {file.path} - {file.size} bytes
    </li>
  ));

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

  function outputCss() {
    var output = 'Employee Id,Pay Date,In Date,Time In,Time Out,Total Time,Time Off,Cost Center2,Note\n'
    outputData.forEach(row =>
      output += row.empID+","+"???"+","+row.inDate+","+row.inTime+","+row.outTime+","+row.totTime+","+"???"+","+row.costCtr+',imported from Keystone\n'
    )
    return output
  }

  function parseInput(dataBuffer) {
    const inputData = xlsx.parse(dataBuffer)[0].data
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
      if (rowSplit[2] == '50') {
        // back FROM lunch
        currOutTime = prevRowSplit[1]

        outputData = appendOutputData(outputData, currEmpID,
                                      currInDate, currInTime,
                                      currOutTime, currCostCtr)

        // start entry for this row
        currInTime = rowSplit[1]
        currOutTime = null
        return
      }

      // copy this row to access for next row
      prevRowSplit = rowSplit

      if (currInDate === null) {
        currInDate = rowSplit[0]
      }


      if (currInTime === null) {
        currInTime = rowSplit[1]
      }
    })
    //console.log(outputData)
    setOutputData(outputData)
  }
  function toggleShowInputData() {
    setShowInputData(!showInputData)
  }
  function toggleShowOutputData() {
    setShowOutputData(!showOutputData)
  }
  return (
    <div className="App">
      {files.length == 0 ?
        <div {...getRootProps({className: 'dropzone'})}>
          <input {...getInputProps()} />
          <p style={{position: 'absolute', top: '30%', width: '100%'}}>
            Drag and Drop Keystone xlsx file or click to open file dialog
          </p>
        </div>
        :
        <div style={{position: 'absolute', paddingTop: '20%', width: '100%', backgroundColor: '#d9f1d9'}}>
          <a href={"data:application/css;charset=utf-8,"+outputCss()} download="wfo_import.csv">Download WFO csv file</a>
          <p>or refresh page to import new file</p>
          <h3 style={{textAlign: 'left'}}>Output csv preview</h3>
          <div style={{whiteSpace: 'pre', textAlign: 'left'}}>{outputCss()}</div>
        </div>
      }
      <span style={{position: "fixed", bottom: "0px", right: "0px"}}>version: 2023.03.19</span>

    </div>
  );
}

export default App;
