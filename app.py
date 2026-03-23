from flask import Flask, render_template, request, jsonify
import json
import os
import random

app = Flask(__name__)

QUIZ_FILE = 'quiz_data.json'

def load_quizzes():
    if os.path.exists(QUIZ_FILE):
        with open(QUIZ_FILE, 'r', encoding='utf-8') as f:
            quizzes = json.load(f)
            # 기존 퀴즈에 tags 필드 추가
            for quiz in quizzes:
                if 'tags' not in quiz:
                    quiz['tags'] = []
            return quizzes
    return []

def save_quizzes(quizzes):
    with open(QUIZ_FILE, 'w', encoding='utf-8') as f:
        json.dump(quizzes, f, ensure_ascii=False, indent=4)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/add_quiz', methods=['POST'])
def add_quiz():
    data = request.json
    question = data['question']
    options = data['options']
    answer = int(data['answer']) - 1  # 0-based
    tags = data.get('tags', '').split(',')  # 태그를 콤마로 분리
    tags = [tag.strip() for tag in tags if tag.strip()]  # 공백 제거

    quiz = {
        'question': question,
        'options': options,
        'answer': answer,
        'tags': tags
    }

    quizzes = load_quizzes()
    quizzes.append(quiz)
    save_quizzes(quizzes)
    return jsonify({'message': '퀴즈가 추가되었습니다!'})

@app.route('/get_quizzes')
def get_quizzes():
    tag_filter = request.args.get('tags', '')
    if tag_filter:
        tag_filter = [tag.strip() for tag in tag_filter.split(',') if tag.strip()]
    quizzes = load_quizzes()
    if tag_filter:
        quizzes = [q for q in quizzes if any(tag in q.get('tags', []) for tag in tag_filter)]
    random.shuffle(quizzes)
    return jsonify(quizzes)

@app.route('/take_quiz', methods=['POST'])
def take_quiz():
    data = request.json
    user_answers = data['answers']
    quizzes = load_quizzes()
    results = []
    correct_count = 0

    for i, quiz in enumerate(quizzes):
        user_answer = int(user_answers[i]) - 1
        is_correct = user_answer == quiz['answer']
        if is_correct:
            correct_count += 1
        results.append({
            'question': quiz['question'],
            'user_answer': user_answer + 1,
            'correct_answer': quiz['answer'] + 1,
            'is_correct': is_correct
        })

    return jsonify({'results': results, 'score': f'{correct_count}/{len(quizzes)}'})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)