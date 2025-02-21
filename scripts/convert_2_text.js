const fs = require("fs");
const path = require("path");

// Define an absolute path for the static directory (same as in convert_2_json.js)
const staticDir = path.resolve(__dirname, "..", "app", "static");

// Ensure the static directory exists
if (!fs.existsSync(staticDir)) {
  fs.mkdirSync(staticDir, { recursive: true });
}

// Function to read a JSON file
function readJsonFile(fileName) {
  try {
    const filePath = path.join(staticDir, fileName); // Construct full path
    const rawData = fs.readFileSync(filePath, "utf8");
    return JSON.parse(rawData);
  } catch (error) {
    console.error(`Error reading or parsing ${fileName}:`, error.message);
    return null; // Consistent error handling
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
            .map((value) => value || "") // Handle null/undefined values
            .join("\t") +
          "\t" +
          processedTags
        );
      }),
    ];

    // Define absolute path for the output file in the `static` directory
    const outputPath = path.join(staticDir, fileName);

    // Write the TSV content to the file
    fs.writeFileSync(outputPath, tsvRows.join("\n"));
    console.log(`TSV data saved to ${outputPath}`);
  } catch (error) {
    console.error("Error saving data to TXT file:", error.message);
  }
}

// Main execution
(async () => {
  const jsonFileName = "Custom Study Session.json"; // Read from `app/static`
  const txtFileName = "Custom Study Session.txt"; // Output TXT file name (consistent)

  // Step 1: Read the JSON file
  const jsonData = readJsonFile(jsonFileName);

  if (!jsonData || jsonData.length === 0) {
    console.log("No data found in the JSON file. Exiting...");
    return;
  }

  console.log(`Read ${jsonData.length} records from ${jsonFileName}.`);

  // Step 2: Save the data to a TXT file in the `static` folder
  saveToTxtFile(jsonData, txtFileName);
})();
