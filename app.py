from flask import Flask, render_template, request, jsonify, session, redirect, url_for
import random
import json
import os
from datetime import datetime

app = Flask(__name__)
app.secret_key = 'math_game_secret_key_2024'

# 게임 레벨별 설정
LEVELS = {
    1: {'name': '한자리수', 'min_num': 1, 'max_num': 9, 'points': 10},
    2: {'name': '두자리수', 'min_num': 10, 'max_num': 99, 'points': 20},
    3: {'name': '세자리수', 'min_num': 100, 'max_num': 999, 'points': 30},
}

# 랭킹 데이터 파일
RANKING_FILE = 'rankings.json'

def load_rankings():
    """랭킹 데이터 로드"""
    if os.path.exists(RANKING_FILE):
        with open(RANKING_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []

def save_ranking(student_info, score):
    """랭킹 저장"""
    rankings = load_rankings()
    new_record = {
        'school': student_info['school'],
        'grade': student_info['grade'],
        'name': student_info['name'],
        'score': score,
        'date': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    }
    rankings.append(new_record)
    rankings.sort(key=lambda x: x['score'], reverse=True)
    rankings = rankings[:50]  # 상위 50명만 저장
    
    with open(RANKING_FILE, 'w', encoding='utf-8') as f:
        json.dump(rankings, f, ensure_ascii=False, indent=2)

def generate_problem(operation, level):
    """문제 생성 (객관식 선택지 포함)"""
    level_config = LEVELS[level]
    min_num = level_config['min_num']
    max_num = level_config['max_num']
    
    if operation == 'addition':
        a = random.randint(min_num, max_num)
        b = random.randint(min_num, max_num)
        answer = a + b
        question = f"{a} + {b}"
    elif operation == 'subtraction':
        a = random.randint(min_num, max_num)
        b = random.randint(min_num, min(a, max_num))
        answer = a - b
        question = f"{a} - {b}"
    elif operation == 'multiplication':
        a = random.randint(min_num, min(max_num, 12))
        b = random.randint(min_num, min(max_num, 12))
        answer = a * b
        question = f"{a} × {b}"
    elif operation == 'division':
        b = random.randint(max(2, min_num), min(max_num, 12))
        answer = random.randint(1, 20)
        a = b * answer
        question = f"{a} ÷ {b}"
    
    # 객관식 선택지 생성
    choices = generate_choices(answer, operation)
    
    return {
        'question': question,
        'answer': answer,
        'choices': choices,
        'points': level_config['points']
    }

def generate_choices(correct_answer, operation):
    """객관식 선택지 3개 생성 (정답 1개 + 오답 2개)"""
    choices = [correct_answer]
    
    # 오답 생성
    while len(choices) < 3:
        # 정답을 기준으로 오답 생성
        if operation == 'division':
            # 나눗셈의 경우 작은 수 범위에서 오답 생성
            wrong_answer = random.choice([
                correct_answer + random.randint(1, 5),
                correct_answer - random.randint(1, min(5, correct_answer)) if correct_answer > 5 else correct_answer + random.randint(1, 3),
                correct_answer + random.randint(-3, 3) if random.randint(-3, 3) != 0 else correct_answer + 1
            ])
        else:
            # 다른 연산의 경우
            variation = max(1, int(correct_answer * 0.1)) if correct_answer > 10 else random.randint(1, 5)
            wrong_answer = random.choice([
                correct_answer + random.randint(1, variation * 2),
                correct_answer - random.randint(1, variation) if correct_answer > variation else correct_answer + random.randint(1, variation),
                correct_answer + random.randint(-variation, variation) if random.randint(-variation, variation) != 0 else correct_answer + 1
            ])
        
        # 음수나 중복 방지
        if wrong_answer > 0 and wrong_answer not in choices:
            choices.append(wrong_answer)
    
    # 선택지 섞기
    random.shuffle(choices)
    return choices

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/game')
def game():
    if 'student_info' not in session:
        return redirect(url_for('index'))
    return render_template('game.html', student_info=session['student_info'])

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    student_info = {
        'school': data['school'],
        'grade': data['grade'],
        'name': data['name']
    }
    session['student_info'] = student_info
    print(f"Login successful: {student_info}")  # 디버그 로그
    print(f"Session after login: {session}")  # 디버그 로그
    return jsonify({'success': True})

@app.route('/api/problem', methods=['POST'])
def get_problem():
    data = request.json
    operation = data['operation']
    level = data.get('level', 1)
    
    problem = generate_problem(operation, level)
    session['current_problem'] = problem
    
    return jsonify({
        'question': problem['question'],
        'choices': problem['choices'],
        'level': level,
        'level_name': LEVELS[level]['name']
    })

@app.route('/api/answer', methods=['POST'])
def check_answer():
    data = request.json
    user_answer = int(data['answer'])
    
    current_problem = session.get('current_problem')
    if not current_problem:
        return jsonify({'error': 'No active problem'})
    
    is_correct = user_answer == current_problem['answer']
    points = current_problem['points'] if is_correct else 0
    
    # 세션에 점수 누적
    if 'total_score' not in session:
        session['total_score'] = 0
    session['total_score'] += points
    
    return jsonify({
        'correct': is_correct,
        'answer': current_problem['answer'],
        'points': points,
        'total_score': session['total_score']
    })

@app.route('/api/save_score', methods=['POST'])
def save_score():
    if 'student_info' not in session or 'total_score' not in session:
        return jsonify({'error': 'No student info or score'})
    
    save_ranking(session['student_info'], session['total_score'])
    return jsonify({'success': True})

@app.route('/api/rankings')
def get_rankings():
    rankings = load_rankings()
    return jsonify(rankings[:10])  # 상위 10명

@app.route('/rankings')
def rankings_page():
    return render_template('rankings.html')

# 헬스 체크 엔드포인트 추가
@app.route('/health')
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0'
    })

if __name__ == '__main__':
    import os
    # 환경 변수에서 설정 읽기
    debug_mode = os.getenv('FLASK_DEBUG', 'false').lower() == 'true'
    port = int(os.getenv('PORT', 5001))
    host = os.getenv('HOST', '0.0.0.0')
    
    print(f"Starting Flask app on {host}:{port} (debug={debug_mode})")
    app.run(debug=debug_mode, host=host, port=port)
