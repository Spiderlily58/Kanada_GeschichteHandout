/* GLOSSARY FUNCTIONS */
let activeCategory = 'all';

function openGlossary() {
  document.getElementById('glossaryModal').classList.add('open');
  document.body.style.overflow = 'hidden';
  document.getElementById('glossarySearch').focus();
}

function closeGlossary() {
  document.getElementById('glossaryModal').classList.remove('open');
  document.body.style.overflow = '';
}

function backdropClose(event) {
  if (event.target.id === 'glossaryModal') {
    closeGlossary();
  }
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeGlossary();
  }
});

function setFilter(category, button) {
  activeCategory = category;
  document.querySelectorAll('.filters button').forEach((filterButton) => {
    filterButton.classList.remove('active');
  });
  button.classList.add('active');
  filterGlossary();
}

function filterGlossary() {
  const query = document.getElementById('glossarySearch').value.toLowerCase();
  let shown = 0;

  document.querySelectorAll('#glossaryWords .word').forEach((word) => {
    const matchesSearch = word.innerText.toLowerCase().includes(query);
    const matchesCategory = activeCategory === 'all' || word.dataset.category === activeCategory;
    const visible = matchesSearch && matchesCategory;
    word.style.display = visible ? 'block' : 'none';
    if (visible) shown++;
  });

  document.getElementById('glossaryEmpty').style.display = shown ? 'none' : 'block';
}

let quizQuestions = [];

function renderQuiz(questions) {
  const container = document.getElementById('quizQuestions');
  quizQuestions = questions;
  container.replaceChildren();

  questions.forEach((item) => {
    const question = document.createElement('div');
    question.className = 'question';

    const heading = document.createElement('h3');
    heading.textContent = `${item.number}. ${item.question}`;
    question.appendChild(heading);

    item.options.forEach((option, index) => {
      const label = document.createElement('label');
      label.className = 'option';

      const input = document.createElement('input');
      input.type = 'radio';
      input.name = `q${item.number}`;
      input.value = String.fromCharCode(97 + index);

      label.append(input, document.createTextNode(` ${option}`));
      question.appendChild(label);
    });

    container.appendChild(question);
  });

  document.getElementById('progress').textContent =
    `${questions.length} questions · Multiple choice · Instant feedback after submission`;
}

function getCorrectAnswerKey(item) {
  const answer = String(item.rightAnswer).trim().toLowerCase();
  const optionIndex = item.options.findIndex((option) => option.toLowerCase() === answer);
  return optionIndex === -1 ? answer : String.fromCharCode(97 + optionIndex);
}

function gradeQuiz() {
  const result = document.getElementById('result');
  const feedback = document.getElementById('feedback');

  if (!quizQuestions.length) {
    result.textContent = 'Quiz questions have not loaded. Please check that the page is opened from a web server.';
    return;
  }

  const unanswered = quizQuestions.filter((item) =>
    !document.querySelector(`input[name="q${item.number}"]:checked`)
  );

  document.querySelectorAll('#quiz .option').forEach((label) => {
    label.classList.remove('correct', 'incorrect');
  });

  if (unanswered.length) {
    result.classList.add('has-error');
    result.textContent = `You have answered ${quizQuestions.length - unanswered.length} out of ${quizQuestions.length} questions. Please answer all questions before submitting.`;
    feedback.replaceChildren();
    return;
  }

  let score = 0;
  result.classList.remove('has-error');
  feedback.replaceChildren();

  quizQuestions.forEach((item) => {
    const selected = document.querySelector(`input[name="q${item.number}"]:checked`);
    const correctKey = getCorrectAnswerKey(item);
    const correct = selected.value === correctKey;
    if (correct) score++;

    const correctInput = document.querySelector(`input[name="q${item.number}"][value="${correctKey}"]`);
    correctInput.closest('label').classList.add('correct');
    if (!correct) selected.closest('label').classList.add('incorrect');

    const row = document.createElement('article');
    row.className = `feedback-item ${correct ? 'is-correct' : 'is-incorrect'}`;
    const heading = document.createElement('div');
    heading.className = 'feedback-heading';
    const strong = document.createElement('strong');
    strong.textContent = `Question ${item.number}`;
    const status = document.createElement('span');
    status.className = 'feedback-status';
    status.textContent = correct ? 'Correct' : 'Review';
    heading.append(strong, status);

    const explanation = document.createElement('p');
    explanation.textContent = item.explanation || `The correct answer was ${item.options[correctKey.charCodeAt(0) - 97]}.`;
    row.append(heading, explanation);
    feedback.appendChild(row);
  });

  const scoreMessage = score >= 9 ? 'Excellent work!' : score >= 7 ? 'Great job!' : score >= 5 ? 'Good start — keep revising!' : 'Keep practising — you can do it!';
  const percentage = Math.round((score / quizQuestions.length) * 100);
  const scoreWheel = document.createElement('div');
  scoreWheel.className = 'score-wheel';
  scoreWheel.setAttribute('role', 'img');
  scoreWheel.setAttribute('aria-label', `${percentage}% correct`);
  scoreWheel.style.setProperty('--score-percent', `${percentage}%`);
  const wheelLabel = document.createElement('span');
  wheelLabel.textContent = `${percentage}%`;
  scoreWheel.appendChild(wheelLabel);

  const scoreNumber = document.createElement('strong');
  scoreNumber.className = 'score-number';
  scoreNumber.textContent = `${score}/${quizQuestions.length}`;
  const scoreCopy = document.createElement('div');
  scoreCopy.className = 'score-copy';
  const scoreLabel = document.createElement('span');
  scoreLabel.textContent = 'YOUR SCORE';
  const scoreSummary = document.createElement('p');
  scoreSummary.textContent = scoreMessage;
  scoreCopy.append(scoreLabel, scoreSummary);
  result.replaceChildren(scoreWheel, scoreNumber, scoreCopy);
  result.classList.add('is-complete');
  document.querySelectorAll('#quiz input[type="radio"]').forEach((input) => {
    input.disabled = true;
  });
  document.getElementById('submitQuizBtn').disabled = true;
  result.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function resetQuiz() {
  document.querySelectorAll('#quiz input[type="radio"]').forEach((input) => {
    input.checked = false;
    input.disabled = false;
  });
  document.querySelectorAll('#quiz .option').forEach((label) => {
    label.classList.remove('correct', 'incorrect');
  });
  document.getElementById('result').textContent = '';
  document.getElementById('result').classList.remove('is-complete', 'has-error');
  document.getElementById('feedback').replaceChildren();
  document.getElementById('submitQuizBtn').disabled = false;
}

async function loadQuizQuestions() {
  const container = document.getElementById('quizQuestions');

  try {
    const response = await fetch(new URL('questions.json', document.baseURI));
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const questions = await response.json();
    if (!Array.isArray(questions) || questions.some((item) =>
      !Number.isInteger(item.number) || !item.question || !Array.isArray(item.options) ||
      !item.options.length || !item.rightAnswer
    )) {
      throw new Error('The question data has an invalid format');
    }

    renderQuiz(questions);
  } catch (error) {
    container.innerHTML = '<p class="quiz-intro">Could not load quiz questions. Open this page through a local web server and check that questions.json is beside index.html.</p>';
    console.error('Unable to load quiz questions:', error);
  }
}

document.getElementById('submitQuizBtn').addEventListener('click', gradeQuiz);
document.getElementById('resetQuizBtn').addEventListener('click', resetQuiz);
loadQuizQuestions();