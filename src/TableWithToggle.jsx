import React, { useState, useEffect } from 'react';
import './TableWithToggle.css'; // Import the CSS file
import ScoreMapping from './ScoreMapping.json';
import ScrollToTopButton from './ScrollToTopButton'

const TableWithToggle = () => {
  const [jsonData, setJsonData] = useState({});
  const [tableData, setTableData] = useState({});
  const [showClearButton, setShowClearButton] = useState(false); // Flag to show/hide the Clear button
  const [totalScore, setTotalScore] = useState(0); // Total score for all categories

  useEffect(() => {
    setJsonData(ScoreMapping);
    // Extract categories dynamically from JSON data
    const categories = Object.keys(ScoreMapping);
    const initialTableData = {};

    categories.forEach((category) => {
      initialTableData[category] = {};
      Object.keys(ScoreMapping[category]).forEach((key) => {
        initialTableData[category][key] = false;
      });
    });

    //Set initial value
    initialTableData['基本']['底'] = true;
    console.log(initialTableData);
    setTableData(initialTableData);


  }, []);

  const toggleCell = (category, key) => {
    setTableData((prevTableData) => ({
      ...prevTableData,
      [category]: {
        ...prevTableData[category],
        [key]: !prevTableData[category][key],
      },
    }));
    setShowClearButton(true); // Show the Clear button when a button is toggled
  };

  // Implement the clearToggledCells function
  const clearToggledCells = () => {
    const clearedTableData = {};

    Object.keys(tableData).forEach((category) => {
      clearedTableData[category] = {};

      Object.keys(tableData[category]).forEach((key) => {
        clearedTableData[category][key] = (key === '底') ? true : false;
      });
    });
    console.log(clearedTableData);
    setTableData(clearedTableData);
    setShowClearButton(false);
  };

  // Calculate the total score when a button is toggled
  useEffect(() => {
    let sum = 0;
    Object.keys(tableData).forEach((category) => {
      Object.keys(tableData[category]).forEach((key) => {
        if (tableData[category][key]) {
          sum += jsonData[category][key];
        }
      });
    });
    setTotalScore(sum);
  }, [tableData, jsonData]);

  // Check if jsonData is loaded before rendering
  if (!jsonData || !Object.keys(jsonData).length) {
    return null; // or return an error message or loading indicator
  }

  return (
    <div>
      <h1 className="centered-heading">港式台牌計番器</h1>
      <div className="header-container">
        <h2 className="total-score">番數: {totalScore}</h2>
        {totalScore > 5 && (
          <button className="clear-button" onClick={clearToggledCells}>Clear</button>
        )}
      </div>

      {Object.keys(jsonData).map((category) => (
        <div key={category}>
          <h3>{category}</h3>
          <div className="table-container">
            <div className="button-container">
              {Object.keys(jsonData[category]).map((key) => (
                <button
                  key={key}
                  onClick={() => {
                    if (key === '底') {
                      return; // Disable click
                    }
                    toggleCell(category, key)
                  }
                  }
                  className={tableData[category][key] ? 'button active' : 'button'}
                >
                  {key}
                </button>
              ))}
            </div>
          </div>
        </div>
      ))}
      <div>
        <ScrollToTopButton />
      </div>
    </div>
  );
};

export default TableWithToggle;