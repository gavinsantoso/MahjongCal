import React, { useState } from "react";
// import './ScrollToTopButton.css';

const ToggleExclusiveGroup = ({
  entry,
  category,
  tableData,
  jsonData,
  setTableData,
  setShowClearButton,
}) => {
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

  return (
    <div key={entry.key} className="toggle-exclusive-group">
      {entry.exclusiveButton.map((button) => (
        <button
          key={button.key}
          onClick={() => {
            if (entry.disableClick) {
              return;
            }
            toggleExclusiveButton(category.name, button.key, entry.key);
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
};

export default ToggleExclusiveGroup;
