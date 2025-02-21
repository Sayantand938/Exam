class Quiz {
  constructor(jsonUrl) {
    this.questionContainer = document.getElementById("question-container");
    this.tagsContainer = document.getElementById("tags");
    this.jsonUrl = jsonUrl;
    this.questions = [];
    this.currentQuestionIndex = 0;
    this.userAnswers = [];
    this.answered = false;
    this.modal = null;
    this.totalQuestions = 0;
    this.correctAnswers = 0;
    this.wrongAnswers = 0;
    this.notAnswered = 0;
    this.wrongAnswerNoteIds = [];
    this.OPTION_COUNT = 4;
    this.CORRECT_COLOR = "#00d26a";
    this.INCORRECT_COLOR = "#d32f2f";
    this.DEFAULT_COLOR = "#888888";
    this.DEFAULT_FILL = "#2c2c2c";

    this.handleAnswerChange = this.handleAnswerChange.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.copyWrongNoteIdsToClipboard =
      this.copyWrongNoteIdsToClipboard.bind(this);
  }

  async init() {
    try {
      this.questions = await this.loadQuestions();
      this.totalQuestions = this.questions.length;
      this.userAnswers = new Array(this.totalQuestions).fill(null);
      this.notAnswered = this.totalQuestions;
      this.showQuestion(this.currentQuestionIndex);
      this.setupEventListeners();
    } catch (error) {
      console.error("Error initializing quiz:", error);
    }
  }

  async loadQuestions() {
    const response = await fetch(this.jsonUrl);
    return await response.json();
  }

  showQuestion(index) {
    if (index < 0 || index >= this.questions.length) index = 0;
    this.currentQuestionIndex = index;
    this.answered = false;

    const question = this.questions[index];
    this.questionContainer.innerHTML = this.createQuestionHTML(question, index);
    this.displayTags(question.tags);

    if (this.userAnswers[index] !== null) {
      const selectedOption = document.querySelector(
        `input[name="question${index}"][value="${this.userAnswers[index]}"]`
      );
      if (selectedOption) selectedOption.checked = true;
      this.highlightAnswers(index);
      this.disableOptions(index);
    } else {
      this.resetHighlights(index);
    }
  }

  createQuestionHTML(question, questionIndex) {
    const optionsHTML = Array.from({ length: this.OPTION_COUNT }, (_, i) => {
      const optionValue = i + 1;
      const optionText = question[`OP${optionValue}`];
      return `
        <li>
          <label class="custom-radio">
            <input type="radio" name="question${questionIndex}" value="${optionValue}" data-question-index="${questionIndex}">
            <svg class="radio-icon" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" fill="${this.DEFAULT_FILL}" stroke="${this.DEFAULT_COLOR}" stroke-width="3"/>
            </svg>
            <span>${optionText}</span>
          </label>
        </li>
      `;
    }).join("");

    return `
      <div class="question">${question.Question}</div>
      <ul class="options">${optionsHTML}</ul>
    `;
  }

  highlightAnswers(questionIndex) {
    const optionsContainer = this.questionContainer.querySelector(`.options`);
    if (!optionsContainer) return;

    const correctAnswer = this.questions[questionIndex].Answer;
    const selectedAnswer = this.userAnswers[questionIndex];

    optionsContainer
      .querySelectorAll("li label")
      .forEach((label, optionIndex) => {
        const optionValue = String(optionIndex + 1);
        const svg = label.querySelector("svg circle");
        let pathHTML = "";

        // Update the background color (fill) of the SVG circle
        if (optionValue === correctAnswer) {
          svg.setAttribute("fill", this.CORRECT_COLOR); // Green background for correct answer
          svg.setAttribute("stroke", this.CORRECT_COLOR);
          pathHTML =
            '<path d="M6 12l4 4 8-8" stroke="white" stroke-width="3" fill="none"/>'; // Tick mark
        } else if (selectedAnswer === optionValue) {
          svg.setAttribute("fill", this.INCORRECT_COLOR); // Red background for incorrect answer
          svg.setAttribute("stroke", this.INCORRECT_COLOR);
          pathHTML =
            '<path d="M6 6l12 12M18 6L6 18" stroke="white" stroke-width="3" fill="none"/>'; // Cross mark
        } else {
          svg.setAttribute("fill", this.DEFAULT_FILL); // Default background
          svg.setAttribute("stroke", this.DEFAULT_COLOR);
        }

        // Add or remove the tick/cross mark
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

  resetHighlights(questionIndex) {
    const optionsContainer = this.questionContainer.querySelector(`.options`);
    if (!optionsContainer) return;

    optionsContainer.querySelectorAll("li label").forEach((label) => {
      const svg = label.querySelector("svg circle");
      svg.setAttribute("fill", this.DEFAULT_FILL);
      svg.setAttribute("stroke", this.DEFAULT_COLOR);
      const existingPath = svg.nextElementSibling;
      if (existingPath) {
        existingPath.remove();
      }
    });
  }

  disableOptions(questionIndex) {
    const optionsContainer = this.questionContainer.querySelector(`.options`);
    if (!optionsContainer) return;

    optionsContainer
      .querySelectorAll("input[type='radio']")
      .forEach((input) => {
        input.disabled = true;
      });
  }

  setupEventListeners() {
    this.questionContainer.addEventListener("change", this.handleAnswerChange);
    document.addEventListener("keydown", this.handleKeyDown);
  }

  handleAnswerChange(event) {
    if (event.target.matches('input[type="radio"]') && !this.answered) {
      this.answered = true;
      const questionIndex = parseInt(event.target.dataset.questionIndex);
      this.saveAnswer(questionIndex);
      this.highlightAnswers(questionIndex);
      this.disableOptions(questionIndex);
      this.updateScoreboard(questionIndex);
    }
  }

  saveAnswer(questionIndex) {
    const selectedOption = document.querySelector(
      `input[name="question${questionIndex}"]:checked`
    );
    this.userAnswers[questionIndex] = selectedOption
      ? selectedOption.value
      : null;
  }

  handleKeyDown(event) {
    if (event.key === "ArrowLeft") {
      this.navigateQuestions(-1);
    } else if (event.key === "ArrowRight" || event.key === " ") {
      this.navigateQuestions(1);
    } else if (event.altKey && event.key === "x") {
      this.copyNoteIdToClipboard();
    } else if (event.altKey && event.key === "r") {
      this.toggleScoreboardModal();
    }
  }

  navigateQuestions(direction) {
    const newIndex = this.currentQuestionIndex + direction;
    if (newIndex >= 0 && newIndex < this.questions.length) {
      this.saveAnswer(this.currentQuestionIndex);
      this.currentQuestionIndex = newIndex;
      this.showQuestion(this.currentQuestionIndex);
    }
  }

  displayTags(tags) {
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

    this.tagsContainer.innerHTML = tagsHTML;
  }

  copyNoteIdToClipboard() {
    const noteId = this.questions[this.currentQuestionIndex].noteId;
    const textToCopy = `nid:${noteId}`;
    this.copyTextToClipboard(textToCopy);
  }

  copyWrongNoteIdsToClipboard() {
    if (this.wrongAnswerNoteIds.length === 0) {
      console.log("No incorrect answers to copy.");
      return;
    }

    const noteIdString = "nid:" + this.wrongAnswerNoteIds.join(",");
    this.copyTextToClipboard(noteIdString);
  }

  copyTextToClipboard(text) {
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(text)
        .then(() => console.log("Copied to clipboard!"))
        .catch((err) => console.error("Failed to copy: ", err));
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        const successful = document.execCommand("copy");
        console.log(
          "Copying text command was " +
            (successful ? "successful" : "unsuccessful")
        );
      } catch (err) {
        console.error("Oops, unable to copy", err);
      }

      document.body.removeChild(textArea);
    }
  }

  updateScoreboard(questionIndex) {
    const answer = this.userAnswers[questionIndex];
    const correctAnswer = this.questions[questionIndex].Answer;
    const noteId = this.questions[questionIndex].noteId;

    if (answer !== null) {
      if (answer === correctAnswer) {
        this.correctAnswers++;
      } else {
        this.wrongAnswers++;
        this.wrongAnswerNoteIds.push(noteId);
      }
      this.notAnswered = Math.max(0, this.notAnswered - 1);
    }

    if (this.modal && this.modal.style.display === "block") {
      this.updateModalContent();
    }
  }

  createScoreboardModal() {
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
                  <td id="totalQuestions">${this.totalQuestions}</td>
                </tr>
                <tr>
                  <td>Correct Answers</td>
                  <td id="correctAnswers">${this.correctAnswers}</td>
                </tr>
                <tr id="wrongAnswersRow">
                  <td>Wrong Answers</td>
                  <td id="wrongAnswers">${this.wrongAnswers}</td>
                </tr>
                <tr>
                  <td>Not Answered</td>
                  <td id="notAnswered">${this.notAnswered}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);
    this.modal = document.getElementById("scoreboardModal");
    document
      .getElementById("wrongAnswersRow")
      .addEventListener("click", this.copyWrongNoteIdsToClipboard);
  }

  updateModalContent() {
    if (this.modal) {
      document.getElementById("correctAnswers").textContent =
        this.correctAnswers;
      document.getElementById("wrongAnswers").textContent = this.wrongAnswers;
      document.getElementById("notAnswered").textContent = this.notAnswered;
    }
  }

  toggleScoreboardModal() {
    if (!this.modal) {
      this.createScoreboardModal();
    }
    const modalContainer = document.getElementById("scoreboardModalContainer");
    if (modalContainer.style.display === "block") {
      this.closeModal();
    } else {
      this.updateModalContent();
      modalContainer.style.display = "block";
      window.addEventListener("click", (e) => this.outsideClick(e));
    }
  }

  closeModal() {
    const modalContainer = document.getElementById("scoreboardModalContainer");
    if (modalContainer) {
      modalContainer.style.display = "none";
      window.removeEventListener("click", (e) => this.outsideClick(e));
    }
  }

  outsideClick(e) {
    const modalContainer = document.getElementById("scoreboardModalContainer");
    if (e.target === modalContainer) {
      this.closeModal();
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const quiz = new Quiz(document.body.dataset.jsonUrl);
  quiz.init();
});
