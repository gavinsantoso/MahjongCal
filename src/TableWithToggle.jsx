import React, { useState, useEffect } from 'react';
import './TableWithToggle.css'; // Import the CSS file

const TableWithToggle = () => {
  const [jsonData, setJsonData] = useState({});
  const [tableData, setTableData] = useState({});
  const [showClearButton, setShowClearButton] = useState(false); // Flag to show/hide the Clear button
  const [totalScore, setTotalScore] = useState(0); // Total score for all categories

  useEffect(() => {
    // Fetch the JSON data when the component mounts
    fetch('/src/ScoreMapping.json') 
      .then((response) => response.json())
      .then((data) => {
        setJsonData(data);

        // Extract categories dynamically from JSON data
        const categories = Object.keys(data);
        const initialTableData = {};

        categories.forEach((category) => {
          initialTableData[category] = {};
          Object.keys(data[category]).forEach((key) => {
            initialTableData[category][key] = false;
          });
        });

        setTableData(initialTableData);
      })
      .catch((error) => {
        console.error('Error fetching JSON data:', error);
      });
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
        clearedTableData[category][key] = false;
      });
    });

    setTableData(clearedTableData);
    setShowClearButton(false); // Hide the Clear button after clearing
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
        {showClearButton && (
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
                  onClick={() => toggleCell(category, key)}
                  className={tableData[category][key] ? 'button active' : 'button'}
                >
                  {key}
                </button>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TableWithToggle;