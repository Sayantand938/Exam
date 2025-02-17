const fs = require("fs");
const path = require("path");

// Get the absolute path of the frontend directory
const frontendDir = path.resolve(__dirname, "../frontend");

// Ensure the frontend directory exists
if (!fs.existsSync(frontendDir)) {
  fs.mkdirSync(frontendDir, { recursive: true });
}

// Function to send a request to Anki-Connect
async function ankiConnectRequest(action, params = {}) {
  const request = {
    action: action,
    version: 6,
    params: params,
  };

  try {
    const response = await fetch("http://localhost:8765", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    const result = await response.json();
    if (result.error) {
      throw new Error(`Anki-Connect error: ${result.error}`);
    }
    return result.result;
  } catch (error) {
    console.error("Error communicating with Anki-Connect:", error.message);
    return null;
  }
}

// Function to fetch all note IDs from a specific deck
async function fetchNoteIdsFromDeck(deckName) {
  try {
    const query = `deck:"${deckName}"`;
    const noteIds = await ankiConnectRequest("findNotes", { query });

    if (!noteIds || noteIds.length === 0) {
      console.log(`No notes found in the '${deckName}' deck.`);
      return [];
    }

    console.log(`Fetched ${noteIds.length} note IDs from '${deckName}'.`);
    return noteIds;
  } catch (error) {
    console.error("Error fetching note IDs:", error.message);
    return [];
  }
}

// Function to fetch detailed information for a list of note IDs
async function fetchNoteDetails(noteIds) {
  try {
    const noteDetails = await ankiConnectRequest("notesInfo", {
      notes: noteIds,
    });

    if (!noteDetails || noteDetails.length === 0) {
      console.log("No note details found.");
      return [];
    }

    console.log(
      `Fetched detailed information for ${noteDetails.length} notes.`
    );
    return noteDetails;
  } catch (error) {
    console.error("Error fetching note details:", error.message);
    return [];
  }
}

// Function to extract relevant information from note details
function extractRelevantInfo(notes) {
  return notes.map((note) => ({
    noteId: note.noteId,
    Question: note.fields.Question?.value || "",
    OP1: note.fields.OP1?.value || "",
    OP2: note.fields.OP2?.value || "",
    OP3: note.fields.OP3?.value || "",
    OP4: note.fields.OP4?.value || "",
    Answer: note.fields.Answer?.value || "",
    Extra: note.fields.Extra?.value || "",
    tags: note.tags || [],
  }));
}

// Function to save data to a JSON file
function saveToJsonFile(data, fileName) {
  try {
    const outputPath = path.join(frontendDir, fileName);
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    console.log(`Data saved to ${outputPath}`);
  } catch (error) {
    console.error("Error saving data to file:", error.message);
  }
}

// Main execution
(async () => {
  const deckName = "Custom Study Session";

  const noteIds = await fetchNoteIdsFromDeck(deckName);
  if (noteIds.length === 0) {
    console.log("No notes to process. Exiting...");
    return;
  }

  const noteDetails = await fetchNoteDetails(noteIds);
  if (noteDetails.length === 0) {
    console.log("No note details to process. Exiting...");
    return;
  }

  const simplifiedNotes = extractRelevantInfo(noteDetails);
  const outputFileName = "Custom Study Session.json";
  saveToJsonFile(simplifiedNotes, outputFileName);
})();
