from flask import Flask, render_template, request, jsonify
import json
import os
import random
import re
from werkzeug.utils import secure_filename
import anthropic
from PIL import Image
import base64
import io

app = Flask(__name__)

@app.errorhandler(Exception)
def handle_exception(e):
    return jsonify({'error': str(e)}), 500

# 파일 업로드 설정
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp'}
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max

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

@app.route('/get_all_quizzes')
def get_all_quizzes():
    quizzes = load_quizzes()
    return jsonify(quizzes)

@app.route('/delete_quiz/<int:index>', methods=['DELETE'])
def delete_quiz(index):
    quizzes = load_quizzes()
    if 0 <= index < len(quizzes):
        quizzes.pop(index)
        save_quizzes(quizzes)
        return jsonify({'message': '퀴즈가 삭제되었습니다!'})
    return jsonify({'error': '유효하지 않은 인덱스'}), 400

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def parse_questions(text):
    questions = []
    blocks = re.split(r'\n-{2,}\n?', text.strip())
    for block in blocks:
        block = block.strip()
        if not block:
            continue
        lines = [l.strip() for l in block.split('\n') if l.strip()]
        question = ''
        options = [None, None, None, None]
        answer = -1
        question_mode = False
        for line in lines:
            if re.match(r'^문제\s*:', line):
                question = re.sub(r'^문제\s*:\s*', '', line).strip()
                question_mode = True
            elif re.match(r'^(1[\.\)\s]|①)', line):
                options[0] = re.sub(r'^(1[\.\)\s]+|①\s*)', '', line).strip()
                question_mode = False
            elif re.match(r'^(2[\.\)\s]|②)', line):
                options[1] = re.sub(r'^(2[\.\)\s]+|②\s*)', '', line).strip()
                question_mode = False
            elif re.match(r'^(3[\.\)\s]|③)', line):
                options[2] = re.sub(r'^(3[\.\)\s]+|③\s*)', '', line).strip()
                question_mode = False
            elif re.match(r'^(4[\.\)\s]|④)', line):
                options[3] = re.sub(r'^(4[\.\)\s]+|④\s*)', '', line).strip()
                question_mode = False
            elif re.match(r'^정답\s*:', line):
                m = re.search(r'[1-4]', line)
                if m:
                    answer = int(m.group()) - 1
                question_mode = False
            elif question_mode and question:
                question += ' ' + line
        if question and all(opt is not None for opt in options) and 0 <= answer <= 3:
            questions.append({'question': question, 'options': options, 'answer': answer, 'tags': []})
    return questions

@app.route('/ocr', methods=['POST'])
def extract_ocr():
    data = request.json
    if not data or 'image' not in data:
        return jsonify({'error': '이미지 데이터가 없습니다'}), 400

    api_key = os.environ.get('CLAUDE_API_KEY') or os.environ.get('ANTHROPIC_API_KEY')
    if not api_key:
        return jsonify({'error': 'CLAUDE_API_KEY 환경변수가 설정되지 않았습니다.'}), 500

    try:
        client = anthropic.Anthropic(api_key=api_key)
        raw = data['image'].split(',')[1] if ',' in data['image'] else data['image']
        img_bytes = base64.b64decode(raw)
        image = Image.open(io.BytesIO(img_bytes))
        if image.mode != 'RGB':
            image = image.convert('RGB')
        max_dim = 1600
        if max(image.size) > max_dim:
            ratio = max_dim / max(image.size)
            image = image.resize((int(image.size[0] * ratio), int(image.size[1] * ratio)), Image.LANCZOS)
        buffered = io.BytesIO()
        image.save(buffered, format="PNG")
        image_data = base64.standard_b64encode(buffered.getvalue()).decode('utf-8')

        message = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=2048,
            timeout=25,
            messages=[{
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {"type": "base64", "media_type": "image/png", "data": image_data}
                    },
                    {
                        "type": "text",
                        "text": "이 사진 속 모든 4지선다 문제를 추출해줘. 사진이 회전되어 있어도 바르게 읽어줘.\n문제가 여러 개면 각 문제를 --- 로 구분해줘.\n선택지가 ①②③④ 형식이어도 반드시 1. 2. 3. 4. 형식으로 변환해.\n마크다운 금지. 형식 외 설명 금지.\n\n문제: [문제 내용]\n1. [선택지1]\n2. [선택지2]\n3. [선택지3]\n4. [선택지4]\n정답: [1 또는 2 또는 3 또는 4]\n---"
                    }
                ]
            }]
        )

        text = message.content[0].text
        questions = parse_questions(text)

        if not questions:
            return jsonify({'error': '문제를 인식하지 못했습니다. 사진을 더 선명하게 찍어주세요.', 'raw': text}), 400

        quizzes = load_quizzes()
        quizzes.extend(questions)
        save_quizzes(quizzes)

        return jsonify({'saved': len(questions), 'questions': [q['question'] for q in questions]})
    except Exception as e:
        return jsonify({'error': f'오류: {str(e)}'}), 500

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