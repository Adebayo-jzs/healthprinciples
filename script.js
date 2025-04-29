let allQuestions = [];
let questions = [];
let currentQuestionIndex = 0;
let quizCompleted = false;
let timerInterval;
let secondsSpent = 0;

// document.addEventListener("keydown", function(event) {
//   if (event.key === "Enter" && !quizCompleted) {
//     nextQuestion();
//   }
  
// });
document.addEventListener("keydown", function(event) {
    // if (quizCompleted) return;
  
    if (event.key === "Enter") {
        if (currentQuestionIndex === questions.length - 1) {
            confirmSubmit();
        } else{
            nextQuestion();
        }
    } else if (event.key === "ArrowRight") {
        if (currentQuestionIndex === questions.length - 1) {
            confirmSubmit();
        } else{
            nextQuestion();
        }
    } else if (event.key === "ArrowLeft") {
       prevQuestion();
    } // else if (event.key === "ArrowRight") {
    //   if (currentQuestionIndex === questions.length - 1) {
    //     confirmSubmit();
    //   }
    // }
  });

function askNumberOfQuestions() {
  fetch("questions.json")
    .then(response => response.json())
    .then(data => {
      allQuestions = data;
      // Shuffle questions randomly
      allQuestions = allQuestions.sort(() => Math.random() - 0.5);
      let num = prompt(`How many questions do you want? (Max: ${allQuestions.length})`);
      num = parseInt(num);
      if (!num || num <= 0 || num > allQuestions.length) {
        alert("Invalid number. Starting full quiz.");
        num = allQuestions.length;
      }
      questions = allQuestions.slice(0, num);
      startQuiz();
    })
    .catch(error => console.error("Error loading questions:", error));
}

function startQuiz() {
  // Clear all selected answers
//   questions.forEach(q => delete q.selected);
//   progressBar.forEach(q => delete q.selected);
  currentQuestionIndex = 0;
  quizCompleted = false;
  document.getElementById("summary").innerHTML = "";
  document.getElementById("result").innerHTML = "";
  document.getElementById("startBtn").style.display = "none";
  document.getElementById("retakeBtn").style.display = "none";
  document.getElementById("restartBtn").style.display = "inline-block";
  document.getElementById("prevBtn").style.display = "inline-block";
  document.getElementById("prevBtn").disabled = true;
  document.getElementById("nextBtn").style.display = "inline-block";
  document.getElementById("progress-container").style.display = "block";
  document.getElementById("timer").style.display = "block";
  generateQuestionButtons();
  startTimer();
  displayQuestion();
  document.getElementById("progress-bar").style.width = "0%";
}
// function restartQuiz(){
//   currentQuestionIndex = 0;
//   quizCompleted = false;
//   document.getElementById("progress-bar").style.width = "0%";
// }
function generateQuestionButtons() {
  const nav = document.getElementById("question-navigation");
  nav.innerHTML = "";
  questions.forEach((_, index) => {
    const btn = document.createElement("button");
    btn.innerText = index + 1;
    btn.onclick = () => jumpToQuestion(index);
    nav.appendChild(btn);
  });
}

function jumpToQuestion(index) {
  currentQuestionIndex = index;
  displayQuestion();
}

function displayQuestion() {
  if (quizCompleted) return;

  const quizContainer = document.getElementById("quiz-container");
  const q = questions[currentQuestionIndex];

  quizContainer.innerHTML = `
    <p><strong>${currentQuestionIndex + 1}. ${q.question}</strong></p>
    ${q.options.map(option => `
      <div class="option ${q.selected === option ? 'selected' : ''}" onclick="selectAnswer('${option}')">${option}</div>
    `).join('')}
  `;

  document.getElementById("questionCount").innerText = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
  updateNavigation();
//   updateProgressBar();
  highlightCurrentButton();
}

// function selectAnswer(selectedOption) {
//   questions[currentQuestionIndex].selected = selectedOption;
//   displayQuestion();
// }
function selectAnswer(selectedOption) {
    questions[currentQuestionIndex].selected = selectedOption;
    displayQuestion(); // Re-render to show selected highlight
    updateProgressBar(); // ✅ Now update progress ONLY when user selects an answer
    // highlightCurrentButton();
  }
  

function updateNavigation() {
  document.getElementById("prevBtn").disabled = currentQuestionIndex === 0;
  document.getElementById("nextBtn").style.display = currentQuestionIndex < questions.length - 1 ? "inline-block" : "none";
  document.getElementById("submitBtn").style.display = currentQuestionIndex === questions.length - 1 ? "inline-block" : "none";
}

function nextQuestion() {
  if (currentQuestionIndex < questions.length - 1) {
    currentQuestionIndex++;
    displayQuestion();
  }
}

function prevQuestion() {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    displayQuestion();
  }
}

function highlightCurrentButton() {
  const navButtons = document.querySelectorAll("#question-navigation button");
  navButtons.forEach(btn => btn.classList.remove("active"));
  
  if (navButtons[currentQuestionIndex]) {
    navButtons[currentQuestionIndex].classList.add("active");
  } else if(navButtons[currentQuestionIndex] && questions[currentQuestionIndex].selected){
    navButtons[currentQuestionIndex].classList.add("active");
  }
   if(questions[currentQuestionIndex].selected) {
    navButtons[currentQuestionIndex].classList.add("select");
}
}

function confirmSubmit() {
  if (confirm("Are you sure you want to submit the quiz?")) {
    submitQuiz();
  }
}

function submitQuiz() {
  quizCompleted = true;
  clearInterval(timerInterval);

  let score = 0;
  const quizContainer = document.getElementById("quiz-container");
  quizContainer.innerHTML = "<h2>Quiz Completed!</h2>";

  questions.forEach(q => {
    if (q.selected === q.correct) {
      score++;
    }
  });

  document.getElementById("result").innerHTML = `
    Your score: ${score} / ${questions.length} <br>
    Time Taken: ${formatTime(secondsSpent)}
  `;

  showSummary();
  document.getElementById("prevBtn").style.display = "none";
  document.getElementById("nextBtn").style.display = "none";
  document.getElementById("submitBtn").style.display = "none";
}

function showSummary() {
  const summaryContainer = document.getElementById("summary");
  summaryContainer.innerHTML = "<h3>Quiz Summary:</h3>";

  questions.forEach((q, index) => {
    let status = "";
    if (q.selected) {
      status = q.selected === q.correct ? `<span class="correct">✅ Correct</span>` : `<span class="incorrect">❌ Incorrect</span>`;
    } else {
      status = `<span class="incorrect">❌ Not Answered</span>`;
    }

    summaryContainer.innerHTML += `
      <div class="summary-item">
        <p><strong>${index + 1}. ${q.question}</strong></p>
        <p>Your answer: <em>${q.selected || "None"}</em> ${status}</p>
        <p>Correct answer: <span class="correct">${q.correct}</span></p>
      </div>
    `;
  });
}

function startTimer() {
  clearInterval(timerInterval);
  secondsSpent = 0;
  timerInterval = setInterval(() => {
    secondsSpent++;
    document.getElementById("timer").innerText = `Time Spent: ${formatTime(secondsSpent)}`;
  }, 1000);
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

// function updateProgressBar() {
//   const progressBar = document.getElementById("progress-bar");
//   const percentage = ((currentQuestionIndex + 1) / questions.length) * 100;
//   progressBar.style.width = `${percentage}%`;
// }
function updateProgressBar() {
    const progressBar = document.getElementById("progress-bar");
    // Count how many questions have been answered
    const answeredCount = questions.filter(q => q.selected !== undefined && q.selected !== null).length;
    const percentage = (answeredCount / questions.length) * 100;
    progressBar.style.width = `${percentage}%`;
  }