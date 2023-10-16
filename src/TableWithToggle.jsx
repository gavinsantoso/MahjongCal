import React, { useState, useEffect } from "react";
import "./TableWithToggle.css"; // Import the CSS file
import ScoreMapping from "./ScoreMapping.json"; // Import your JSON data
import ScrollToTopButton from "./ScrollToTopButton";

const TableWithToggle = () => {
  const [jsonData, setJsonData] = useState({});
  const [tableData, setTableData] = useState({});
  const [toggleIndices, setToggleIndices] = useState({}); // Keep track of which toggleList item to show
  const [showClearButton, setShowClearButton] = useState(false); // Flag to show/hide the Clear button
  const [totalScore, setTotalScore] = useState(0); // Total score for all categories

  //Initial Table Data
  useEffect(() => {
    setJsonData(ScoreMapping);
    const categories = ScoreMapping.categories;
    const initialTableData = {};
    const initialToggleIndices = {};

    categories.forEach((category) => {
      initialTableData[category.name] = {};
      category.entries.forEach((entry) => {
        initialTableData[category.name][entry.key] = entry.defaultToggle;
        if (entry.toggleList) {
          initialToggleIndices[entry.key] = -1; // Initial non-toggled state
        }
      });
    });

    setTableData(initialTableData);
    setToggleIndices(initialToggleIndices);
  }, []);

  const toggleCell = (category, key) => {
    let currentToggleIndex = toggleIndices[key] !== undefined ? toggleIndices[key] : -1;
    const entry = jsonData.categories
      .find((c) => c.name === category)
      .entries.find((e) => e.key === key);

    // If the entry has a toggleList
    if (entry.toggleList) {
      currentToggleIndex = (currentToggleIndex + 1) % (entry.toggleList.length + 1);
      if (currentToggleIndex === entry.toggleList.length) {
        currentToggleIndex = -1; // Loop back to the initial non-toggled state
      }
      setToggleIndices((prevIndices) => ({
        ...prevIndices,
        [key]: currentToggleIndex,
      }));

      const newValue = currentToggleIndex === -1 ? entry.defaultToggle : true;
      setTableData((prevData) => ({
        ...prevData,
        [category]: {
          ...prevData[category],
          [key]: newValue,
        },
      }));
    } else {
      // If the entry does not have a toggleList
      setTableData((prevData) => ({
        ...prevData,
        [category]: {
          ...prevData[category],
          [key]: !prevData[category][key],
        },
      }));
    }
    setShowClearButton(true);
};


  // Implement the clearToggledCells function
  const clearToggledCells = () => {
    const clearedTableData = {};
    const initialToggleIndices = {};

    jsonData.categories.forEach((category) => {
        clearedTableData[category.name] = {};
        category.entries.forEach((entry) => {
            clearedTableData[category.name][entry.key] = entry.defaultToggle;
            if (entry.toggleList) {
                initialToggleIndices[entry.key] = -1; // Initial non-toggled state
            }
        });
    });

    setTableData(clearedTableData);
    setToggleIndices(initialToggleIndices);
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
              if (entry.toggleList && toggleIndices[key] !== -1) {
                // If a toggleList item is active, consider its value
                sum += entry.toggleList[toggleIndices[key]].value;
              } else {
                // Otherwise, consider the main entry's value
                sum += entry.value;
              }
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
              {category.entries.map((entry) => {
                const displayText =
                  entry.toggleList && toggleIndices[entry.key] !== undefined
                    ? toggleIndices[entry.key] === -1
                      ? entry.display
                      : entry.toggleList[toggleIndices[entry.key]].display
                    : entry.display;
                return (
                  <button
                    key={entry.key}
                    onClick={() => {
                      if (entry.disableClick) {
                        return;
                      }
                      toggleCell(category.name, entry.key);
                    }}
                    className={
                      tableData[category.name][entry.key]
                        ? "button active"
                        : "button"
                    }
                  >
                    {displayText}
                  </button>
                );
              })}
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
