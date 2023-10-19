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

  // Initial Table Data
  useEffect(() => {
    setJsonData(ScoreMapping);
    const categories = ScoreMapping.categories;
    const initialTableData = {};
    const initialToggleIndices = {};

    categories.forEach((category) => {
      initialTableData[category.name] = {};
      category.entries.forEach((entry) => {
        //Initial each button toggle state
        initialTableData[category.name][entry.key] = entry.defaultToggle;
        if (entry.toggleList) {
          initialToggleIndices[entry.key] = -1; // Initial non-toggled state
        }

        // Check if there's a exclusiveButton and add defaultToggle to initialTableData
        if (entry.exclusiveButton) {
          entry.exclusiveButton.forEach((button) => {
            initialTableData[category.name][button.key] = button.defaultToggle;
          });
        }
      });
    });

    setTableData(initialTableData);
    setToggleIndices(initialToggleIndices);
  }, []);

  const toggleExclusiveButton = (category, key, parentKey) => {
    const updatedTableData = { ...tableData };
    const categoryData = jsonData.categories.find((c) => c.name === category);
    const entry = categoryData.entries.find((e) => e.key === parentKey);

    // Iterate through the exclusiveButton and update state
    entry.exclusiveButton.forEach((button) => {
      if (button.key === key) {
        // Toggle the button if it's currently untoggled, or untoggle if it's currently toggled
        updatedTableData[category][button.key] =
          !updatedTableData[category][button.key];
      } else {
        updatedTableData[category][button.key] = false; // Untoggle other buttons in the same group
      }
    });

    setTableData(updatedTableData);
    setShowClearButton(true);
  };

  const toggleCell = (category, key) => {
    let currentToggleIndex =
      toggleIndices[key] !== undefined ? toggleIndices[key] : -1;

    const categoryData = jsonData.categories.find((c) => c.name === category);
    const entry = categoryData.entries.find((e) => e.key === key);

    // If the entry has a toggleList
    if (entry.toggleList) {
      currentToggleIndex =
        (currentToggleIndex + 1) % (entry.toggleList.length + 1);
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
      // If the entry does not have a toggleList and toggleGroup
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
            } else {
              // Check within exclusiveButton
              const entryWithinGroup = categoryData.entries.find((e) =>
                e.exclusiveButton
                  ? e.exclusiveButton.some(
                      (groupItem) => groupItem.key === key
                    )
                  : false
              );

              if (entryWithinGroup) {
                entryWithinGroup.exclusiveButton.forEach((groupItem) => {
                  if (
                    groupItem.key === key &&
                    tableData[category][groupItem.key]
                  ) {
                    sum += groupItem.value;
                  }
                });
              }
            }
          }
        }
      });
    });
    setTotalScore(sum);
  }, [tableData, jsonData, toggleIndices]);

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
            重置
          </button>
        )}
      </div>

      {jsonData.categories.map((category) => (
        <div key={category.name}>
          <h3>{category.name}</h3>
          <div className="table-container">
            {category.rowGroups.map((rowGroup, rowIndex) => (
              <div key={rowIndex} className="row">
                {rowGroup.map((entryKey) => {
                  const entry = category.entries.find(
                    (entry) => entry.key === entryKey
                  );

                  if (entry.exclusiveButton) {
                    return (
                      <div key={entry.key} className="toggle-exclusive-group">
                        {entry.exclusiveButton.map((button) => (
                          <button
                            key={button.key}
                            onClick={() => {
                              if (entry.disableClick) {
                                return;
                              }
                              toggleExclusiveButton(
                                category.name,
                                button.key,
                                entry.key
                              );
                            }}
                            className={
                              tableData[category.name][button.key]
                                ? "button toggle-button active"
                                : "button toggle-button"
                            }
                          >
                            {button.display}
                          </button>
                        ))}
                      </div>
                    );
                  } else {
                    // Handle regular buttons
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
                            ? "button toggle-button active"
                            : "button toggle-button"
                        }
                      >
                        {displayText}
                      </button>
                    );
                  }
                })}
              </div>
            ))}
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
