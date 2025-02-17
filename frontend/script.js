document.addEventListener("DOMContentLoaded", () => {
  const questionContainer = document.getElementById("question-container");
  const tagsContainer = document.getElementById("tags");

  let questions = [];
  let currentQuestionIndex = 0;
  let userAnswers = [];
  let answered = false;
  let modal;

  // Scoreboard elements
  let totalQuestions;
  let correctAnswers = 0;
  let wrongAnswers = 0;
  let notAnswered;
  let wrongAnswerNoteIds = []; // Store noteIds of wrong answers

  const OPTION_COUNT = 4;
  const CORRECT_COLOR = "#00d26a";
  const INCORRECT_COLOR = "#d32f2f";
  const DEFAULT_COLOR = "#888888";
  const DEFAULT_FILL = "#2c2c2c";

  fetch("Custom Study Session.json")
    .then((response) => response.json())
    .then((data) => {
      questions = data;
      totalQuestions = questions.length;
      userAnswers = new Array(questions.length).fill(null);
      notAnswered = questions.length;

      showQuestion(currentQuestionIndex);
    })
    .catch((error) => console.error("Error loading questions:", error));

  function showQuestion(index) {
    if (index < 0 || index >= questions.length) index = 0;
    currentQuestionIndex = index;
    answered = false;

    const question = questions[index];
    questionContainer.innerHTML = createQuestionHTML(question, index);
    displayTags(question.tags);

    if (userAnswers[index] !== null) {
      const selectedOption = document.querySelector(
        `input[name="question${index}"][value="${userAnswers[index]}"]`
      );
      if (selectedOption) {
        selectedOption.checked = true;
      }
      highlightAnswers(index);
      disableOptions(index);
    } else {
      resetHighlights(index);
    }
  }

  function createQuestionHTML(question, questionIndex) {
    const optionsHTML = Array.from({ length: OPTION_COUNT }, (_, i) => {
      const optionValue = i + 1;
      const optionText = question[`OP${optionValue}`];
      return `
        <li>
          <label class="custom-radio">
            <input type="radio" name="question${questionIndex}" value="${optionValue}" data-question-index="${questionIndex}">
             <svg class="radio-icon" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" fill="${DEFAULT_FILL}" stroke="${DEFAULT_COLOR}" stroke-width="3"/>
              </svg>
            <span>${optionText}</span>
          </label>
        </li>
      `;
    }).join("");

    return `
      <div class="question">
        ${question.Question}
      </div>
      <ul class="options">
        ${optionsHTML}
      </ul>
    `;
  }

  function highlightAnswers(questionIndex) {
    const optionsContainer = document.querySelector(
      `#question-container .options`
    );
    if (!optionsContainer) return;

    const correctAnswer = questions[questionIndex].Answer;
    const selectedAnswer = userAnswers[questionIndex];

    optionsContainer
      .querySelectorAll("li label")
      .forEach((label, optionIndex) => {
        const optionValue = String(optionIndex + 1);
        const svg = label.querySelector("svg circle");
        let pathHTML = "";

        if (optionValue === correctAnswer) {
          svg.setAttribute("fill", CORRECT_COLOR);
          svg.setAttribute("stroke", CORRECT_COLOR);
          pathHTML =
            '<path d="M6 12l4 4 8-8" stroke="white" stroke-width="3" fill="none"/>';
        } else if (selectedAnswer === optionValue) {
          svg.setAttribute("fill", INCORRECT_COLOR);
          svg.setAttribute("stroke", INCORRECT_COLOR);
          pathHTML =
            '<path d="M6 6l12 12M18 6L6 18" stroke="white" stroke-width="3" fill="none"/>';
        } else {
          svg.setAttribute("fill", DEFAULT_FILL);
          svg.setAttribute("stroke", DEFAULT_COLOR);
        }

        if (pathHTML) {
          const existingPath = svg.nextElementSibling;
          if (!existingPath) {
            svg.insertAdjacentHTML("afterend", pathHTML);
          }
        } else {
          const existingPath = svg.nextElementSibling;
          if (existingPath) {
            existingPath.remove();
          }
        }
      });
  }

  function resetHighlights(questionIndex) {
    const optionsContainer = document.querySelector(
      `#question-container .options`
    );
    if (!optionsContainer) return;

    optionsContainer.querySelectorAll("li label").forEach((label) => {
      const svg = label.querySelector("svg circle");
      svg.setAttribute("fill", DEFAULT_FILL);
      svg.setAttribute("stroke", DEFAULT_COLOR);
      const existingPath = svg.nextElementSibling;
      if (existingPath) {
        existingPath.remove();
      }
    });
  }

  function disableOptions(questionIndex) {
    const optionsContainer = document.querySelector(
      `#question-container .options`
    );
    if (!optionsContainer) return;

    optionsContainer
      .querySelectorAll("input[type='radio']")
      .forEach((input) => {
        input.disabled = true;
      });
  }

  questionContainer.addEventListener("change", (event) => {
    if (event.target.matches('input[type="radio"]') && !answered) {
      answered = true;
      const questionIndex = parseInt(event.target.dataset.questionIndex);
      saveAnswer(questionIndex);
      highlightAnswers(questionIndex);
      disableOptions(questionIndex);
      updateScoreboard(questionIndex);
    }
  });

  function saveAnswer(questionIndex) {
    const selectedOption = document.querySelector(
      `input[name="question${questionIndex}"]:checked`
    );
    userAnswers[questionIndex] = selectedOption ? selectedOption.value : null;
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      navigateQuestions(-1);
    } else if (event.key === "ArrowRight" || event.key === " ") {
      navigateQuestions(1);
    } else if (event.altKey && event.key === "x") {
      copyNoteIdToClipboard();
    } else if (event.altKey && event.key === "r") {
      toggleScoreboardModal();
    }
  });

  function navigateQuestions(direction) {
    const newIndex = currentQuestionIndex + direction;

    if (newIndex >= 0 && newIndex < questions.length) {
      saveAnswer(currentQuestionIndex);
      currentQuestionIndex = newIndex;
      showQuestion(currentQuestionIndex);
    }
  }

  function displayTags(tags) {
    const excludedWords = ["MATH", "ENG", "GK", "GI"];
    const filteredTags = tags.filter(
      (tag) => !tag.startsWith("Prelims") && !excludedWords.includes(tag)
    );

    const tagsHTML = filteredTags
      .map((tag) => {
        const tagClass = tag === "Hard" ? "tag tag-hard" : "tag";
        return `<span class="${tagClass}">${tag}</span>`;
      })
      .join(" ");

    tagsContainer.innerHTML = tagsHTML;
  }

  function copyNoteIdToClipboard() {
    const noteId = questions[currentQuestionIndex].noteId;
    const textToCopy = `nid:${noteId}`;

    copyTextToClipboard(textToCopy);
  }

  function copyWrongNoteIdsToClipboard() {
    if (wrongAnswerNoteIds.length === 0) {
      console.log("No incorrect answers to copy.");
      return;
    }

    const noteIdString = "nid:" + wrongAnswerNoteIds.join(","); // Correct format
    copyTextToClipboard(noteIdString);
  }

  function copyTextToClipboard(textToCopy) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(textToCopy)
        .then(() => {
          console.log("Copied to clipboard!");
        })
        .catch((err) => {
          console.error("Failed to copy: ", err);
        });
    } else {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = textToCopy;
      textArea.style.position = "fixed";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        const successful = document.execCommand("copy");
        const msg = successful ? "successful" : "unsuccessful";
        console.log("Fallback: Copying text command was " + msg);
      } catch (err) {
        console.error("Fallback: Oops, unable to copy", err);
      }

      document.body.removeChild(textArea);
    }
  }

  function updateScoreboard(questionIndex) {
    const answer = userAnswers[questionIndex];
    const correctAnswer = questions[questionIndex].Answer;
    const noteId = questions[questionIndex].noteId;

    if (answer !== null) {
      if (answer === correctAnswer) {
        correctAnswers++;
        notAnswered = Math.max(0, notAnswered - 1);
      } else {
        wrongAnswers++;
        notAnswered = Math.max(0, notAnswered - 1);
        wrongAnswerNoteIds.push(noteId); // Store the noteId
      }
    }

    if (modal && modal.style.display === "block") {
      updateModalContent();
    }
  }

  function createScoreboardModal() {
    const modalHTML = `
      <div class="modal-container" id="scoreboardModalContainer">
        <div class="modal" id="scoreboardModal">
          <div class="modal-content">
            <h2>Scoreboard</h2>
            <table>
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Total Questions</td>
                  <td id="totalQuestions">${totalQuestions}</td>
                </tr>
                <tr>
                  <td>Correct Answers</td>
                  <td id="correctAnswers">${correctAnswers}</td>
                </tr>
                <tr id="wrongAnswersRow">
                  <td>Wrong Answers</td>
                  <td id="wrongAnswers">${wrongAnswers}</td>
                </tr>
                <tr>
                  <td>Not Answered</td>
                  <td id="notAnswered">${notAnswered}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML("beforeend", modalHTML);
    modal = document.getElementById("scoreboardModal");

    // Add click listener to the "Wrong Answers" row
    document
      .getElementById("wrongAnswersRow")
      .addEventListener("click", copyWrongNoteIdsToClipboard);
  }

  function updateModalContent() {
    document.getElementById("correctAnswers").textContent = correctAnswers;
    document.getElementById("wrongAnswers").textContent = wrongAnswers;
    document.getElementById("notAnswered").textContent = notAnswered;
  }

  function toggleScoreboardModal() {
    if (!modal) {
      createScoreboardModal();
    }
    const modalContainer = document.getElementById("scoreboardModalContainer");
    if (modalContainer.style.display === "block") {
      closeModal();
    } else {
      updateModalContent();
      modalContainer.style.display = "block";
      window.addEventListener("click", outsideClick);
    }
  }

  function closeModal() {
    const modalContainer = document.getElementById("scoreboardModalContainer");
    modalContainer.style.display = "none";
    window.removeEventListener("click", outsideClick);
  }

  function outsideClick(e) {
    const modalContainer = document.getElementById("scoreboardModalContainer");
    if (e.target === modalContainer) {
      closeModal();
    }
  }
});
