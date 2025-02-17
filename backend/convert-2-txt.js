// const fs = require("fs");

// // Function to read a JSON file
// function readJsonFile(fileName) {
//   try {
//     const rawData = fs.readFileSync(fileName, "utf8");
//     return JSON.parse(rawData);
//   } catch (error) {
//     console.error(`Error reading or parsing ${fileName}:`, error.message);
//     return null;
//   }
// }

// // Function to save data to a TXT file with TSV format
// function saveToTxtFile(data, fileName) {
//   try {
//     // Exclude the `noteId` field and convert data to TSV format
//     const tsvRows = [
//       "#separator:tab", // Metadata line 1
//       "#html:true", // Metadata line 2
//       "#tags column:8", // Metadata line 3
//       ...data.map((row) => {
//         const { noteId, tags, ...rest } = row; // Exclude `noteId` and handle `tags`
//         const processedTags = Array.isArray(tags) ? tags.join(" ") : ""; // Join tags with spaces
//         return (
//           Object.values(rest)
//             .map((value) => value || "")
//             .join("\t") +
//           "\t" +
//           processedTags
//         );
//       }),
//     ];

//     // Write the TSV content to the file
//     fs.writeFileSync(fileName, tsvRows.join("\n"));
//     console.log(`TSV data saved to ${fileName}`);
//   } catch (error) {
//     console.error("Error saving data to TXT file:", error.message);
//   }
// }

// // Main execution
// (async () => {
//   const jsonFileName = "Custom Study Session.json"; // Input JSON file
//   const txtFileName = "Custom Study Session.txt"; // Output TXT file

//   // Step 1: Read the JSON file
//   const jsonData = readJsonFile(jsonFileName);

//   if (!jsonData || jsonData.length === 0) {
//     console.log("No data found in the JSON file. Exiting...");
//     return;
//   }

//   console.log(`Read ${jsonData.length} records from ${jsonFileName}.`);

//   // Step 2: Save the data to a TXT file
//   saveToTxtFile(jsonData, txtFileName);
// })();

const fs = require("fs");
const path = require("path");

// Get the absolute path of the frontend directory
const frontendDir = path.resolve(__dirname, "../frontend");

// Ensure the frontend directory exists
if (!fs.existsSync(frontendDir)) {
  fs.mkdirSync(frontendDir, { recursive: true });
}

// Function to read a JSON file
function readJsonFile(fileName) {
  try {
    const rawData = fs.readFileSync(fileName, "utf8");
    return JSON.parse(rawData);
  } catch (error) {
    console.error(`Error reading or parsing ${fileName}:`, error.message);
    return null;
  }
}

// Function to save data to a TXT file with TSV format
function saveToTxtFile(data, fileName) {
  try {
    // Exclude the `noteId` field and convert data to TSV format
    const tsvRows = [
      "#separator:tab", // Metadata line 1
      "#html:true", // Metadata line 2
      "#tags column:8", // Metadata line 3
      ...data.map((row) => {
        const { noteId, tags, ...rest } = row; // Exclude `noteId` and handle `tags`
        const processedTags = Array.isArray(tags) ? tags.join(" ") : ""; // Join tags with spaces
        return (
          Object.values(rest)
            .map((value) => value || "")
            .join("\t") +
          "\t" +
          processedTags
        );
      }),
    ];

    // Define absolute path for the output file
    const outputPath = path.join(frontendDir, fileName);

    // Write the TSV content to the file
    fs.writeFileSync(outputPath, tsvRows.join("\n"));
    console.log(`TSV data saved to ${outputPath}`);
  } catch (error) {
    console.error("Error saving data to TXT file:", error.message);
  }
}

// Main execution
(async () => {
  const jsonFileName = path.resolve(__dirname, "Custom Study Session.json"); // Absolute input JSON file path
  const txtFileName = "Custom Study Session.txt"; // Output TXT file name

  // Step 1: Read the JSON file
  const jsonData = readJsonFile(jsonFileName);

  if (!jsonData || jsonData.length === 0) {
    console.log("No data found in the JSON file. Exiting...");
    return;
  }

  console.log(`Read ${jsonData.length} records from ${jsonFileName}.`);

  // Step 2: Save the data to a TXT file in the frontend folder
  saveToTxtFile(jsonData, txtFileName);
})();
