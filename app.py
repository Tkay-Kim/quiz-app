from flask import Flask, render_template, request, jsonify
import json
import os
import random
from werkzeug.utils import secure_filename
import anthropic
from PIL import Image
import base64
import io

app = Flask(__name__)

# Claude API 클라이언트 초기화
client = anthropic.Anthropic(api_key=os.environ.get('CLAUDE_API_KEY'))

# 파일 업로드 설정
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp'}
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
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

@app.route('/extract_ocr', methods=['POST'])
def extract_ocr():
    if 'file' not in request.files:
        return jsonify({'error': '파일이 없습니다'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': '파일을 선택하세요'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'error': 'PNG, JPG, JPEG, GIF, BMP 파일만 업로드 가능합니다'}), 400
    
    try:
        # 이미지를 base64로 인코딩
        image = Image.open(file.stream)
        # RGBA, 팔레트 등 다양한 모드 처리
        if image.mode != 'RGB':
            image = image.convert('RGB')
        # 핸드폰 대용량 사진 리사이즈 (Claude API 전송 최적화)
        max_dim = 1600
        if max(image.size) > max_dim:
            ratio = max_dim / max(image.size)
            new_size = (int(image.size[0] * ratio), int(image.size[1] * ratio))
            image = image.resize(new_size, Image.LANCZOS)
        buffered = io.BytesIO()
        image.save(buffered, format="PNG")
        image_data = base64.standard_b64encode(buffered.getvalue()).decode('utf-8')
        
        # Claude Vision API로 이미지 분석
        message = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=2048,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": "image/png",
                                "data": image_data
                            }
                        },
                        {
                            "type": "text",
                            "text": "이 사진 속 4지선다 문제 하나를 추출해줘. 사진이 회전되어 있어도 텍스트를 바르게 읽어줘. 사진에 문제가 여러 개면 첫 번째 문제만 추출해.\n\n선택지가 ①②③④ 또는 가나다라 형식이어도 반드시 아래처럼 1. 2. 3. 4. 형식으로 변환해서 출력해.\n마크다운(**볼드** 등) 절대 금지. 다른 설명 없이 아래 형식만:\n\n문제: [문제 내용]\n1. [선택지1]\n2. [선택지2]\n3. [선택지3]\n4. [선택지4]\n정답: [1 또는 2 또는 3 또는 4]\n\n정답 표시가 없으면 정답 줄은 생략해도 됨."
                        }
                    ]
                }
            ]
        )
        
        text = message.content[0].text
        return jsonify({'text': text})
    except Exception as e:
        return jsonify({'error': f'OCR 처리 중 오류: {str(e)}'}), 500

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