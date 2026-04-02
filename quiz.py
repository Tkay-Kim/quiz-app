import json
import os
import random

# 퀴즈 데이터 파일 경로
QUIZ_FILE = 'quiz_data.json'

def load_quizzes():
    """저장된 퀴즈 데이터를 불러옵니다."""
    if os.path.exists(QUIZ_FILE):
        with open(QUIZ_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []

def save_quizzes(quizzes):
    """퀴즈 데이터를 파일에 저장합니다."""
    with open(QUIZ_FILE, 'w', encoding='utf-8') as f:
        json.dump(quizzes, f, ensure_ascii=False, indent=4)

def add_quiz():
    """새로운 퀴즈를 추가합니다."""
    question = input("문제를 입력하세요: ")
    options = []
    for i in range(4):
        option = input(f"선택지 {i+1}: ")
        options.append(option)
    answer = int(input("정답 번호 (1-4): ")) - 1  # 0-based index
    while answer < 0 or answer > 3:
        answer = int(input("정답 번호는 1-4 사이여야 합니다: ")) - 1

    quiz = {
        'question': question,
        'options': options,
        'answer': answer
    }

    quizzes = load_quizzes()
    quizzes.append(quiz)
    save_quizzes(quizzes)
    print("퀴즈가 추가되었습니다!")

def take_quiz():
    """저장된 퀴즈를 풀어봅니다."""
    quizzes = load_quizzes()
    if not quizzes:
        print("저장된 퀴즈가 없습니다. 먼저 퀴즈를 추가하세요.")
        return

    random.shuffle(quizzes)  # 랜덤 순서로 섞기
    correct = 0
    total = len(quizzes)

    for quiz in quizzes:
        print(f"\n문제: {quiz['question']}")
        for i, option in enumerate(quiz['options']):
            print(f"{i+1}. {option}")
        try:
            user_answer = int(input("정답 번호를 입력하세요 (1-4): ")) - 1
            if user_answer == quiz['answer']:
                print("정답입니다!")
                correct += 1
            else:
                print(f"틀렸습니다. 정답은 {quiz['answer']+1}번입니다.")
        except ValueError:
            print("유효한 번호를 입력하세요.")

    print(f"\n결과: {correct}/{total} 정답")

def main():
    while True:
        print("\n=== 4지선다 퀴즈 프로그램 ===")
        print("1. 퀴즈 추가")
        print("2. 퀴즈 풀기")
        print("3. 종료")
        choice = input("선택: ")

        if choice == '1':
            add_quiz()
        elif choice == '2':
            take_quiz()
        elif choice == '3':
            break
        else:
            print("잘못된 선택입니다.")

if __name__ == "__main__":
    main()