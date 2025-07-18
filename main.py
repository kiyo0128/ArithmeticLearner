#!/usr/bin/env python3

import http.server
import socketserver
import json
import os
import time
import random
from urllib.parse import parse_qs, urlparse

class WebAppHandler(http.server.SimpleHTTPRequestHandler):
    
    def generate_math_question(self, difficulty=1):
        """Generate a math question based on difficulty level"""
        if difficulty == 1:
            # Simple addition/subtraction
            num1 = random.randint(1, 20)
            num2 = random.randint(1, 20)
            operation = random.choice(['+', '-'])
            if operation == '+':
                answer = num1 + num2
                question = f"{num1} + {num2} = ?"
            else:
                if num1 < num2:
                    num1, num2 = num2, num1
                answer = num1 - num2
                question = f"{num1} - {num2} = ?"
        else:
            # More complex operations
            num1 = random.randint(1, 50)
            num2 = random.randint(1, 10)
            operation = random.choice(['+', '-', '*'])
            if operation == '+':
                answer = num1 + num2
                question = f"{num1} + {num2} = ?"
            elif operation == '-':
                if num1 < num2:
                    num1, num2 = num2, num1
                answer = num1 - num2
                question = f"{num1} - {num2} = ?"
            else:  # multiplication
                answer = num1 * num2
                question = f"{num1} × {num2} = ?"
        
        return {
            'id': f"math_{int(time.time())}_{random.randint(1000, 9999)}",
            'type': 'math',
            'question': question,
            'answer': str(answer),
            'difficulty': difficulty,
            'explanation': f"計算結果は {answer} です。"
        }
    
    def generate_language_question(self, difficulty=1):
        """Generate a Japanese language question"""
        questions = [
            {
                'question': '「早い」の反対語はどれですか？',
                'options': ['遅い', '速い', '近い', '遠い', '高い'],
                'answer': '遅い',
                'explanation': '「早い」の反対語は「遅い」です。'
            },
            {
                'question': '「大きい」の反対語はどれですか？',
                'options': ['小さい', '長い', '短い', '太い', '細い'],
                'answer': '小さい',
                'explanation': '「大きい」の反対語は「小さい」です。'
            },
            {
                'question': '「暑い」の反対語はどれですか？',
                'options': ['寒い', '冷たい', '涼しい', '暖かい', '熱い'],
                'answer': '寒い',
                'explanation': '「暑い」の反対語は「寒い」です。'
            },
            {
                'question': '「重い」の反対語はどれですか？',
                'options': ['軽い', '軟らかい', '硬い', '強い', '弱い'],
                'answer': '軽い',
                'explanation': '「重い」の反対語は「軽い」です。'
            },
            {
                'question': '「新しい」の反対語はどれですか？',
                'options': ['古い', '若い', '新品', '綺麗', '汚い'],
                'answer': '古い',
                'explanation': '「新しい」の反対語は「古い」です。'
            }
        ]
        
        selected = random.choice(questions)
        return {
            'id': f"lang_{int(time.time())}_{random.randint(1000, 9999)}",
            'type': 'language',
            'question': selected['question'],
            'options': selected['options'],
            'answer': selected['answer'],
            'difficulty': difficulty,
            'explanation': selected['explanation']
        }
    
    def check_answer(self, question, user_answer):
        """Check if the user's answer is correct"""
        if question['type'] == 'math':
            # For math questions, normalize the answer
            correct_answer = str(question['answer']).strip()
            user_answer = str(user_answer).strip()
            return correct_answer == user_answer
        elif question['type'] == 'language':
            # For language questions, exact match
            return question['answer'] == user_answer
        return False
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()
    
    def do_GET(self):
        if self.path == '/api/health':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            response = json.dumps({'status': 'ok', 'timestamp': time.strftime('%Y-%m-%dT%H:%M:%S.000Z')})
            self.wfile.write(response.encode())
        elif self.path.startswith('/api/questions/generate'):
            # Parse query parameters
            parsed_url = urlparse(self.path)
            params = parse_qs(parsed_url.query)
            
            question_type = params.get('type', ['math'])[0]
            difficulty = int(params.get('difficulty', ['1'])[0])
            
            try:
                if question_type == 'math':
                    question = self.generate_math_question(difficulty)
                elif question_type == 'language':
                    question = self.generate_language_question(difficulty)
                else:
                    self.send_response(400)
                    self.send_header('Content-type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    response = json.dumps({'error': 'Invalid question type'})
                    self.wfile.write(response.encode())
                    return
                
                # Store question in global storage
                if not hasattr(WebAppHandler, 'global_questions'):
                    WebAppHandler.global_questions = {}
                WebAppHandler.global_questions[question['id']] = question
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                response = json.dumps(question)
                self.wfile.write(response.encode())
                
                print(f"✅ {question_type}問題生成: {question['question']}")
                
            except Exception as e:
                print(f"❌ 問題生成エラー: {e}")
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                response = json.dumps({'error': str(e)})
                self.wfile.write(response.encode())
        elif self.path == '/' or self.path == '/index.html':
            try:
                with open('client/dist/index.html', 'r', encoding='utf-8') as f:
                    content = f.read()
                self.send_response(200)
                self.send_header('Content-type', 'text/html')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(content.encode())
            except FileNotFoundError:
                self.send_response(404)
                self.end_headers()
                self.wfile.write(b'File not found')
        else:
            super().do_GET()
    
    def do_POST(self):
        if self.path == '/api/users':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                data = json.loads(post_data.decode('utf-8'))
                
                if not data.get('name'):
                    self.send_response(400)
                    self.send_header('Content-type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    response = json.dumps({'error': 'Name is required'})
                    self.wfile.write(response.encode())
                    return
                
                user_id = f"user_{int(time.time())}_{random.randint(1000, 9999)}"
                
                user = {
                    'id': user_id,
                    'name': data['name'],
                    'totalScore': 0,
                    'mathScore': 0,
                    'languageScore': 0,
                    'rank': '初心者',
                    'currentRank': 'bronze',
                    'rewards': [],
                    'createdAt': time.strftime('%Y-%m-%dT%H:%M:%S.000Z')
                }
                
                # Store user in class-level storage
                if not hasattr(WebAppHandler, 'global_storage'):
                    WebAppHandler.global_storage = {}
                WebAppHandler.global_storage[user_id] = user
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                response = json.dumps(user)
                self.wfile.write(response.encode())
                
                print(f"✅ ユーザー作成: {user['name']} ({user_id})")
                
            except json.JSONDecodeError:
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                response = json.dumps({'error': 'Invalid JSON'})
                self.wfile.write(response.encode())
        
        elif self.path == '/api/answers':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                data = json.loads(post_data.decode('utf-8'))
                
                question_id = data.get('questionId')
                user_answer = data.get('answer')
                user_id = data.get('userId')
                
                if not question_id or not user_answer or not user_id:
                    self.send_response(400)
                    self.send_header('Content-type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    response = json.dumps({'error': 'Missing required fields'})
                    self.wfile.write(response.encode())
                    return
                
                # Get question from storage
                if not hasattr(WebAppHandler, 'global_questions'):
                    WebAppHandler.global_questions = {}
                
                question = WebAppHandler.global_questions.get(question_id)
                if not question:
                    self.send_response(404)
                    self.send_header('Content-type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    response = json.dumps({'error': 'Question not found'})
                    self.wfile.write(response.encode())
                    return
                
                # Check if answer is correct
                is_correct = self.check_answer(question, user_answer)
                
                # Calculate score increment
                score_increment = 10 if is_correct else 0
                
                # Update user score
                if not hasattr(WebAppHandler, 'global_storage'):
                    WebAppHandler.global_storage = {}
                
                user = WebAppHandler.global_storage.get(user_id)
                if user:
                    user['totalScore'] += score_increment
                    if question['type'] == 'math':
                        user['mathScore'] += score_increment
                    elif question['type'] == 'language':
                        user['languageScore'] += score_increment
                    
                    # Update rank based on total score
                    if user['totalScore'] >= 100:
                        user['rank'] = 'エキスパート'
                        user['currentRank'] = 'gold'
                    elif user['totalScore'] >= 50:
                        user['rank'] = '中級者'
                        user['currentRank'] = 'silver'
                    else:
                        user['rank'] = '初心者'
                        user['currentRank'] = 'bronze'
                
                # Create answer record
                answer_record = {
                    'id': f"answer_{int(time.time())}_{random.randint(1000, 9999)}",
                    'questionId': question_id,
                    'userId': user_id,
                    'answer': user_answer,
                    'isCorrect': is_correct,
                    'scoreIncrement': score_increment,
                    'answeredAt': time.strftime('%Y-%m-%dT%H:%M:%S.000Z')
                }
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                response = json.dumps(answer_record)
                self.wfile.write(response.encode())
                
                print(f"✅ 回答提出: {user_answer} ({'正解' if is_correct else '不正解'}) - スコア: +{score_increment}")
                
            except json.JSONDecodeError:
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                response = json.dumps({'error': 'Invalid JSON'})
                self.wfile.write(response.encode())
        
        else:
            super().do_POST()

def main():
    print("🚀 学習アプリケーションを起動しています...")
    print("📚 算数・国語問題アプリ")
    print("=" * 50)
    
    PORT = 3001
    
    # Change to the correct directory
    os.chdir('/home/runner/workspace')
    
    # Start Python HTTP server
    try:
        with socketserver.TCPServer(('0.0.0.0', PORT), WebAppHandler) as httpd:
            print("🌐 ========================================")
            print("🚀 学習Webアプリケーションが起動しました！")
            print("🌐 ========================================")
            print(f"📱 アクセスURL: http://localhost:{PORT}")
            print(f"💚 Health check: http://localhost:{PORT}/api/health")
            print("🌐 ========================================")
            print("🎯 ブラウザでアクセスして学習を開始してください！")
            print("========================================")
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 アプリケーションを終了しています...")
        sys.exit(0)
    except Exception as e:
        print(f"❌ エラーが発生しました: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()