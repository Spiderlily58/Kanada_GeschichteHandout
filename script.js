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
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    closeGlossary();
  }
});
function setFilter(category, button) {
  activeCategory = category;
  document.querySelectorAll('.filters button').forEach(b => {
    b.classList.remove('active');
  });
  button.classList.add('active');
  filterGlossary();
}
function filterGlossary() {
  const query = document.getElementById('glossarySearch').value.toLowerCase();
  let shown = 0;
  document.querySelectorAll('#glossaryWords .word').forEach(word => {
    const matchesSearch = word.innerText.toLowerCase().includes(query);
    const matchesCategory = activeCategory === 'all' || word.dataset.category === activeCategory;
    const visible = matchesSearch && matchesCategory;
    word.style.display = visible ? 'block' : 'none';
    if (visible) shown++;
  });
  document.getElementById('glossaryEmpty').style.display = shown ? 'none' : 'block';
}
/* QUIZ ANSWERS AND EXPLANATIONS */
const answers = {
  q1: ['a', 'The Constitution recognizes First Nations, Inuit and Métis as three distinct Indigenous peoples.'],
  q2: ['b', 'Samuel de Champlain founded Quebec City in 1608 as part of New France.'],
  q3: ['b', 'The 1763 Treaty of Paris transferred most of France’s mainland North American territory to Britain.'],
  q4: ['b', 'Confederation took place in 1867, when four colonies united.'],
  q5: ['a', 'The original four provinces were Ontario, Quebec, Nova Scotia and New Brunswick.'],
  q6: ['b', 'The residential school system aimed to assimilate Indigenous children and suppress their languages and cultures.'],
  q7: ['a', 'The Quiet Revolution describes major social, political and economic changes in Quebec during the 1960s.'],
  q8: ['b', 'The Canadian Charter of Rights and Freedoms became part of the Constitution in 1982.'],
  q9: ['b', 'Canada adopted an official multiculturalism policy in 1971.'],
  q10: ['b', 'Indigenous rights and reconciliation remain important issues in contemporary Canada.']
};
/* SUBMIT QUIZ */
function gradeQuiz() {
  const result = document.getElementById('result');
  const feedback = document.getElementById('feedback');
  const questions = Object.keys(answers);
  let score = 0;
  const unanswered = questions.filter(question => {
    return !document.querySelector('input[name="' + question + '"]:checked');
  });
  // Remove old answer colours
  document.querySelectorAll('.option').forEach(label => {
    label.classList.remove('correct', 'incorrect');
  });
  // Check whether all questions have been answered
  if (unanswered.length) {
    result.textContent =
      'You have answered ' +
      (questions.length - unanswered.length) +
      ' out of ' +
      questions.length +
      ' questions. Please answer all questions before submitting.';
    feedback.textContent = '';
    result.scrollIntoView({
      behavior:'smooth',
      block:'center'
    });
    return;
  }
  const explanations = [];
  questions.forEach((question, index) => {
    const selected = document.querySelector(
      'input[name="' + question + '"]:checked'
    );
    const correct = selected.value === answers[question][0];
    if (correct) {
      score++;
    }
    selected.closest('label').classList.add(
      correct ? 'correct' : 'incorrect'
    );
    explanations.push({
      number:index + 1,
      correct:correct,
      explanation:answers[question][1]
    });
  });
  // Display score
  result.textContent =
    'Your score: ' +
    score +
    '/' +
    questions.length +
    ' — ' +
    (
      score >= 9 ? 'Excellent work!' :
      score >= 7 ? 'Great job!' :
      score >= 5 ? 'Good start — keep revising!' :
      'Keep practising — you can do it!'
    );
  // Display explanations
  feedback.replaceChildren();
  explanations.forEach(item => {
    const paragraph = document.createElement('p');
    const strong = document.createElement('strong');
    strong.textContent =
      'Question ' +
      item.number +
      ': ' +
      (item.correct ? 'Correct.' : 'Not quite.');
    paragraph.appendChild(strong);
    paragraph.appendChild(
      document.createTextNode(' ' + item.explanation)
    );
    feedback.appendChild(paragraph);
  });
  // Prevent changing answers after submission
  document.querySelectorAll('#quiz input[type="radio"]').forEach(input => {
    input.disabled = true;
  });
  document.getElementById('submitQuizBtn').disabled = true;
  result.scrollIntoView({
    behavior:'smooth',
    block:'center'
  });
}
/* RESET QUIZ */
function resetQuiz() {
  document.querySelectorAll('#quiz input[type="radio"]').forEach(input => {
    input.checked = false;
    input.disabled = false;
  });
  document.querySelectorAll('#quiz .option').forEach(label => {
    label.classList.remove('correct', 'incorrect');
  });
  document.getElementById('result').textContent = '';
  document.getElementById('feedback').replaceChildren();
  document.getElementById('submitQuizBtn').disabled = false;
  document.getElementById('progress').textContent =
    '10 questions · Multiple choice · Instant feedback after submission';
}
/* CONNECT BUTTONS TO JAVASCRIPT */
document.getElementById('submitQuizBtn').addEventListener('click', gradeQuiz);
document.getElementById('resetQuizBtn').addEventListener('click', resetQuiz);
