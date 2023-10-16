import React, { useState, useEffect } from 'react';
import './TableWithToggle.css'; // Import the CSS file
import ScoreMapping from './ScoreMapping.json'; // Import your JSON data
import ScrollToTopButton from './ScrollToTopButton';

const TableWithToggle = () => {
  const [jsonData, setJsonData] = useState({});
  const [tableData, setTableData] = useState({});
  const [showClearButton, setShowClearButton] = useState(false); // Flag to show/hide the Clear button
  const [totalScore, setTotalScore] = useState(0); // Total score for all categories

  //Initial Table Data
  useEffect(() => {
    setJsonData(ScoreMapping);
    // Extract categories dynamically from JSON data
    const categories = ScoreMapping.categories;
    const initialTableData = {};

    categories.forEach((category) => {
      initialTableData[category.name] = {};
      category.entries.forEach((entry) => {
        initialTableData[category.name][entry.key] = entry.defaultToggle;
      });
    });
    // Set initial value
    setTableData(initialTableData);
  }, []);

  const toggleCell = (category, key, toggleValue = null) => {
    setTableData((prevTableData) => {
        let updatedCategory = { ...prevTableData[category] };
        if (toggleValue !== null) {
            updatedCategory[key] = toggleValue;
        } else {
            updatedCategory[key] = !prevTableData[category][key];
        }
        return {
            ...prevTableData,
            [category]: updatedCategory,
        };
    });
    setShowClearButton(true);
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

    setTableData(clearedTableData);
    setShowClearButton(false);
  };

  // Calculate the total score when a button is toggled
  useEffect(() => {
    let sum = 0;
    Object.keys(tableData).forEach((category) => {
      Object.keys(tableData[category]).forEach((key) => {
        if (tableData[category][key]) {
          // Find the corresponding value in the JSON data
          const categoryData = jsonData.categories.find(
            (cat) => cat.name === category
          );
          if (categoryData) {
            const entry = categoryData.entries.find((e) => e.key === key);
            if (entry) {
              sum += entry.value;
            }
          }
        }
      });
    });
    setTotalScore(sum);
  }, [tableData, jsonData]);

  // Check if jsonData is loaded before rendering
  if (!jsonData || !jsonData.categories || jsonData.categories.length === 0) {
    return null; // or return an error message or loading indicator
  }

  return (
    <div>
      <h1 className="centered-heading">港式台牌計番器</h1>
      <div className="header-container">
        <h2 className="total-score">番數: {totalScore}</h2>
        {totalScore > 5 && (
          <button className="clear-button" onClick={clearToggledCells}>
            Clear
          </button>
        )}
      </div>

      {jsonData.categories.map((category) => (
        <div key={category.name}>
          <h3>{category.name}</h3>
          <div className="table-container">
            <div className="button-container">
              {category.entries.map((entry) => (
                <button
                  key={entry.key}
                  onClick={() => {
                    if (entry.disableClick) {
                      return; // Disable click
                    }
                    toggleCell(category.name, entry.key);
                  }}
                  className={tableData[category.name][entry.key] ? 'button active' : 'button'}
                >
                  {entry.display}
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
