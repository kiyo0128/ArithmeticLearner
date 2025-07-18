#!/usr/bin/env python3
import http.server
import socketserver
import json
import time
import random
from urllib.parse import parse_qs, urlparse

class QuizHandler(http.server.SimpleHTTPRequestHandler):
    
    def log_message(self, format, *args):
        # Override to reduce verbose logging
        pass
    
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
            response = json.dumps({'status': 'ok'})
            self.wfile.write(response.encode())
            print("Health check OK")
            
        elif self.path.startswith('/api/questions/generate'):
            try:
                parsed_url = urlparse(self.path)
                params = parse_qs(parsed_url.query)
                
                question_type = params.get('type', ['math'])[0]
                difficulty = int(params.get('difficulty', ['1'])[0])
                
                if question_type == 'math':
                    num1 = random.randint(1, 20)
                    num2 = random.randint(1, 20)
                    op = random.choice(['+', '-'])
                    if op == '+':
                        answer = num1 + num2
                        q_text = f"{num1} + {num2} = ?"
                    else:
                        if num1 < num2:
                            num1, num2 = num2, num1
                        answer = num1 - num2
                        q_text = f"{num1} - {num2} = ?"
                    
                    question = {
                        'id': f"math_{int(time.time())}_{random.randint(1000, 9999)}",
                        'type': 'math',
                        'question': q_text,
                        'answer': str(answer),
                        'explanation': f"答えは {answer} です。"
                    }
                else:
                    # Language question
                    lang_questions = [
                        {'q': '「早い」の反対語は？', 'opts': ['遅い', '速い', '近い', '遠い', '高い'], 'ans': '遅い'},
                        {'q': '「大きい」の反対語は？', 'opts': ['小さい', '長い', '短い', '太い', '細い'], 'ans': '小さい'},
                        {'q': '「暑い」の反対語は？', 'opts': ['寒い', '冷たい', '涼しい', '暖かい', '熱い'], 'ans': '寒い'},
                        {'q': '「重い」の反対語は？', 'opts': ['軽い', '軟らかい', '硬い', '強い', '弱い'], 'ans': '軽い'},
                        {'q': '「新しい」の反対語は？', 'opts': ['古い', '若い', '新品', '綺麗', '汚い'], 'ans': '古い'}
                    ]
                    
                    selected = random.choice(lang_questions)
                    question = {
                        'id': f"lang_{int(time.time())}_{random.randint(1000, 9999)}",
                        'type': 'language',
                        'question': selected['q'],
                        'options': selected['opts'],
                        'answer': selected['ans'],
                        'explanation': f"正解は「{selected['ans']}」です。"
                    }
                
                # Store question
                if not hasattr(QuizHandler, 'questions'):
                    QuizHandler.questions = {}
                QuizHandler.questions[question['id']] = question
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps(question).encode())
                print(f"Generated {question_type} question: {question['question']}")
                
            except Exception as e:
                print(f"Error generating question: {e}")
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({'error': str(e)}).encode())
        
        elif self.path == '/' or self.path == '/index.html':
            try:
                with open('client/dist/index.html', 'r', encoding='utf-8') as f:
                    content = f.read()
                self.send_response(200)
                self.send_header('Content-type', 'text/html')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(content.encode())
            except:
                self.send_response(404)
                self.end_headers()
                self.wfile.write(b'Not found')
        else:
            super().do_GET()
    
    def do_POST(self):
        if self.path == '/api/users':
            try:
                content_length = int(self.headers['Content-Length'])
                data = json.loads(self.rfile.read(content_length))
                
                user = {
                    'id': f"user_{int(time.time())}_{random.randint(1000, 9999)}",
                    'name': data['name'],
                    'totalScore': 0,
                    'mathScore': 0,
                    'languageScore': 0,
                    'rank': '初心者',
                    'currentRank': 'bronze'
                }
                
                if not hasattr(QuizHandler, 'users'):
                    QuizHandler.users = {}
                QuizHandler.users[user['id']] = user
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps(user).encode())
                print(f"Created user: {user['name']}")
                
            except Exception as e:
                print(f"Error creating user: {e}")
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({'error': str(e)}).encode())
        
        elif self.path == '/api/answers':
            try:
                content_length = int(self.headers['Content-Length'])
                data = json.loads(self.rfile.read(content_length))
                
                question_id = data['questionId']
                user_answer = data['answer']
                user_id = data['userId']
                
                # Get question
                question = getattr(QuizHandler, 'questions', {}).get(question_id)
                if not question:
                    self.send_response(404)
                    self.send_header('Content-type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(json.dumps({'error': 'Question not found'}).encode())
                    return
                
                # Check answer
                is_correct = str(question['answer']).strip() == str(user_answer).strip()
                score_increment = 10 if is_correct else 0
                
                # Update user score
                user = getattr(QuizHandler, 'users', {}).get(user_id)
                if user:
                    user['totalScore'] += score_increment
                    if question['type'] == 'math':
                        user['mathScore'] += score_increment
                    else:
                        user['languageScore'] += score_increment
                    
                    # Update rank
                    if user['totalScore'] >= 100:
                        user['rank'] = 'エキスパート'
                        user['currentRank'] = 'gold'
                    elif user['totalScore'] >= 50:
                        user['rank'] = '中級者'
                        user['currentRank'] = 'silver'
                
                result = {
                    'id': f"answer_{int(time.time())}_{random.randint(1000, 9999)}",
                    'isCorrect': is_correct,
                    'scoreIncrement': score_increment
                }
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps(result).encode())
                print(f"Answer: {user_answer} -> {'Correct' if is_correct else 'Wrong'}")
                
            except Exception as e:
                print(f"Error processing answer: {e}")
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({'error': str(e)}).encode())
        
        else:
            super().do_POST()

if __name__ == "__main__":
    PORT = 3001
    print(f"Starting server on port {PORT}...")
    with socketserver.TCPServer(('0.0.0.0', PORT), QuizHandler) as httpd:
        print(f"Server running at http://localhost:{PORT}")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped")