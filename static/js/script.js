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

    const btn = document.getElementById('extract-ocr-btn');
    btn.disabled = true;
    btn.textContent = '⏳ OCR 처리 중... (10~20초 소요)';

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    fetch('/extract_ocr', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        btn.disabled = false;
        btn.textContent = '🔍 OCR로 텍스트 추출';
        if (data.error) {
            alert('오류: ' + data.error);
        } else {
            // 마크다운 제거 후 표시
            const cleanText = data.text.replace(/\*\*/g, '').replace(/\*/g, '').replace(/`/g, '');
            document.getElementById('ocr-text').value = cleanText;
            document.getElementById('ocr-result').style.display = 'block';
        }
    })
    .catch(error => {
        btn.disabled = false;
        btn.textContent = '🔍 OCR로 텍스트 추출';
        alert('OCR 처리 실패: ' + error);
    });
});

document.getElementById('save-ocr-quiz').addEventListener('click', function() {
    const text = document.getElementById('ocr-text').value;

    // 텍스트에서 문제, 선택지, 정답 추출
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);

    let question = '';
    let options = [null, null, null, null];
    let answer = -1;
    let questionMode = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // 문제 추출
        if (/^문제\s*:/.test(line)) {
            question = line.replace(/^문제\s*:\s*/, '').trim();
            questionMode = true;
        }
        // 선택지 추출 (숫자로 시작하면서 . ) 등으로 구분)
        else if (/^1[\.\)\s]/.test(line)) {
            options[0] = line.replace(/^1[\.\)\s]+/, '').trim();
            questionMode = false;
        } else if (/^2[\.\)\s]/.test(line)) {
            options[1] = line.replace(/^2[\.\)\s]+/, '').trim();
            questionMode = false;
        } else if (/^3[\.\)\s]/.test(line)) {
            options[2] = line.replace(/^3[\.\)\s]+/, '').trim();
            questionMode = false;
        } else if (/^4[\.\)\s]/.test(line)) {
            options[3] = line.replace(/^4[\.\)\s]+/, '').trim();
            questionMode = false;
        }
        // 정답 추출
        else if (/^정답\s*:/.test(line)) {
            const answerMatch = line.match(/[1-4]/);
            if (answerMatch) {
                answer = parseInt(answerMatch[0]) - 1;
            }
            questionMode = false;
        }
        // 다줄 문제 이어붙이기
        else if (questionMode && question) {
            question += ' ' + line;
        }
    }
    
    // 유효성 검사
    if (!question || question.length < 2) {
        alert('❌ 문제를 찾을 수 없습니다.\n\n텍스트를 수정해주세요:\n"문제: [문제 내용]"');
        return;
    }
    
    let missingOptions = [];
    for (let i = 0; i < 4; i++) {
        if (!options[i] || options[i].length < 1) {
            missingOptions.push(i + 1);
        }
    }
    if (missingOptions.length > 0) {
        alert('❌ 선택지가 부족합니다.\n\n다음 선택지를 텍스트에 추가하세요:\n' + missingOptions.join(', ') + '번');
        return;
    }
    
    if (answer < 0 || answer > 3) {
        alert('❌ 정답이 없거나 잘못되었습니다.\n\n텍스트를 확인하고 다음을 추가하세요:\n"정답: [1, 2, 3, 또는 4]"');
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
        if (data.error) {
            alert('❌ 저장 실패: ' + data.error);
        } else {
            alert('✅ ' + data.message);
            document.getElementById('image-upload').value = '';
            document.getElementById('ocr-text').value = '';
            document.getElementById('ocr-result').style.display = 'none';
            document.getElementById('preview-image').style.display = 'none';
        }
    })
    .catch(error => alert('❌ 저장 중 오류: ' + error));
});