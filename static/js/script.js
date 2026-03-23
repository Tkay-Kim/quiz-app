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

// OCR 기능
document.getElementById('image-upload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            document.getElementById('preview-image').src = event.target.result;
            document.getElementById('preview-image').style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById('extract-ocr-btn').addEventListener('click', function() {
    const fileInput = document.getElementById('image-upload');
    if (!fileInput.files.length) {
        alert('사진을 선택하세요');
        return;
    }

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    fetch('/extract_ocr', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert('오류: ' + data.error);
        } else {
            document.getElementById('ocr-text').value = data.text;
            document.getElementById('ocr-result').style.display = 'block';
        }
    })
    .catch(error => alert('OCR 처리 실패: ' + error));
});

document.getElementById('save-ocr-quiz').addEventListener('click', function() {
    const text = document.getElementById('ocr-text').value;
    
    // 텍스트에서 문제, 선택지, 정답 추출
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    
    let question = '';
    let options = [];
    let answer = -1;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        if (line.startsWith('문제:') || line.startsWith('문제 :')) {
            question = line.replace(/^문제\s*:?\s*/, '');
        } else if (line.match(/^1[\.\)]/)) {
            options[0] = line.replace(/^1[\.\)]\s*/, '');
        } else if (line.match(/^2[\.\)]/)) {
            options[1] = line.replace(/^2[\.\)]\s*/, '');
        } else if (line.match(/^3[\.\)]/)) {
            options[2] = line.replace(/^3[\.\)]\s*/, '');
        } else if (line.match(/^4[\.\)]/)) {
            options[3] = line.replace(/^4[\.\)]\s*/, '');
        } else if (line.startsWith('정답:') || line.startsWith('정답 :')) {
            const answerMatch = line.match(/\d/);
            if (answerMatch) {
                answer = parseInt(answerMatch[0]) - 1;
            }
        }
    }
    
    if (!question || options.length !== 4 || answer < 0 || answer > 3) {
        alert('문제, 선택지 4개, 정답이 모두 필요합니다. 텍스트를 수정하세요.');
        return;
    }
    
    fetch('/add_quiz', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            question: question,
            options: options,
            answer: (answer + 1).toString(),
            tags: ''
        })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        document.getElementById('image-upload').value = '';
        document.getElementById('ocr-text').value = '';
        document.getElementById('ocr-result').style.display = 'none';
        document.getElementById('preview-image').style.display = 'none';
    });
});