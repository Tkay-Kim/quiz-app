document.getElementById('add-quiz-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const question = document.getElementById('question').value;
    const options = [
        document.getElementById('option1').value,
        document.getElementById('option2').value,
        document.getElementById('option3').value,
        document.getElementById('option4').value
    ];
    const answer = document.getElementById('answer').value;
    const tags = document.getElementById('tags').value;

    fetch('/add_quiz', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ question, options, answer, tags })
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('add-message').textContent = data.message;
        document.getElementById('add-quiz-form').reset();
    });
});

document.getElementById('start-quiz').addEventListener('click', function() {
    const tagFilter = document.getElementById('tag-filter').value;
    let url = '/get_quizzes';
    if (tagFilter) {
        url += '?tags=' + encodeURIComponent(tagFilter);
    }
    fetch(url)
    .then(response => response.json())
    .then(quizzes => {
        if (quizzes.length === 0) {
            alert('해당 태그의 퀴즈가 없습니다.');
            return;
        }
        displayQuiz(quizzes);
    });
});

function displayQuiz(quizzes) {
    const container = document.getElementById('quiz-questions');
    container.innerHTML = '';
    quizzes.forEach((quiz, index) => {
        const div = document.createElement('div');
        div.className = 'mb-3';
        div.innerHTML = `
            <p class="fw-bold">${quiz.question}</p>
            ${quiz.options.map((option, i) => `
                <div class="form-check">
                    <input class="form-check-input" type="radio" name="q${index}" value="${i+1}" id="q${index}o${i}" required>
                    <label class="form-check-label" for="q${index}o${i}">
                        ${i+1}. ${option}
                    </label>
                </div>
            `).join('')}
        `;
        container.appendChild(div);
    });
    document.getElementById('quiz-container').style.display = 'block';
    document.getElementById('start-quiz').style.display = 'none';
}

document.getElementById('submit-quiz').addEventListener('click', function() {
    const answers = [];
    const questions = document.querySelectorAll('#quiz-questions div');
    questions.forEach((q, index) => {
        const selected = q.querySelector(`input[name="q${index}"]:checked`);
        if (selected) {
            answers.push(selected.value);
        } else {
            answers.push('0'); // No answer
        }
    });

    fetch('/take_quiz', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ answers })
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('score').textContent = `점수: ${data.score}`;
        const details = data.results.map(result => `
            <p>${result.question}</p>
            <p>당신의 답: ${result.user_answer}, 정답: ${result.correct_answer} (${result.is_correct ? '정답' : '오답'})</p>
        `).join('');
        document.getElementById('details').innerHTML = details;
        document.getElementById('quiz-container').style.display = 'none';
        document.getElementById('results').style.display = 'block';
    });
});

document.getElementById('load-quizzes-btn').addEventListener('click', function() {
    fetch('/get_all_quizzes')
    .then(response => response.json())
    .then(quizzes => {
        if (quizzes.length === 0) {
            document.getElementById('quizzes-list').innerHTML = '<p>저장된 퀴즈가 없습니다.</p>';
            return;
        }
        displayQuizzesList(quizzes);
    });
});

function displayQuizzesList(quizzes) {
    const container = document.getElementById('quizzes-list');
    container.innerHTML = '';
    quizzes.forEach((quiz, index) => {
        const div = document.createElement('div');
        div.className = 'card mb-3';
        div.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">${quiz.question}</h5>
                <p class="card-text">
                    <strong>선택지:</strong><br>
                    ${quiz.options.map((opt, i) => `${i+1}. ${opt}`).join('<br>')}
                </p>
                <p class="card-text"><strong>정답:</strong> ${quiz.answer + 1}번</p>
                ${quiz.tags && quiz.tags.length > 0 ? `<p class="card-text"><strong>태그:</strong> ${quiz.tags.join(', ')}</p>` : ''}
                <button class="btn btn-danger btn-sm" onclick="deleteQuiz(${index})">🗑️ 삭제</button>
            </div>
        `;
        container.appendChild(div);
    });
}

function deleteQuiz(index) {
    if (confirm('이 문제를 삭제하시겠습니까?')) {
        fetch(`/delete_quiz/${index}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            document.getElementById('load-quizzes-btn').click();
        });
    }
}