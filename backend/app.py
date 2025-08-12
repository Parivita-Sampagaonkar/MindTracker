from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from nltk.sentiment.vader import SentimentIntensityAnalyzer
import os
import openai


openai.api_key = os.getenv("OPENAI_API_KEY")
if not openai.api_key:
    raise RuntimeError("OPENAI_API_KEY is not set")


app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI']   = 'sqlite:///mindtracker.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

CORS(app)
db = SQLAlchemy(app)
analyzer = SentimentIntensityAnalyzer()

# --- Models ---
class Entry(db.Model):
    id        = db.Column(db.Integer, primary_key=True)
    text      = db.Column(db.Text, nullable=False)
    mood      = db.Column(db.String(20), nullable=False)
    neg       = db.Column(db.Float, nullable=False)
    neu       = db.Column(db.Float, nullable=False)
    pos       = db.Column(db.Float, nullable=False)
    compound  = db.Column(db.Float, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id':        self.id,
            'text':      self.text,
            'mood':      self.mood,
            'neg':       self.neg,
            'neu':       self.neu,
            'pos':       self.pos,
            'compound':  self.compound,
            'timestamp': self.timestamp.isoformat()
        }

# --- Models ---
class Prompt(db.Model):
    id        = db.Column(db.Integer, primary_key=True)
    text      = db.Column(db.Text, nullable=False)
    mood      = db.Column(db.String(20), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

class Feedback(db.Model):
    id        = db.Column(db.Integer, primary_key=True)
    prompt_id = db.Column(db.Integer, db.ForeignKey('prompt.id'), nullable=False)
    feedback  = db.Column(db.Boolean, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

# Create the DB tables on first run
with app.app_context():
    db.create_all()

# --- Endpoints ---

@app.route('/sentiment', methods=['POST'])
def sentiment():
    text   = request.json.get('text', '')
    scores = analyzer.polarity_scores(text)
    return jsonify(scores)

@app.route('/mood', methods=['POST'])
def mood():
    entry = request.json.get('entry', '')
    scores = analyzer.polarity_scores(entry)
    comp = scores['compound']
    if comp >= 0.05:
        mood = 'happy'
    elif comp <= -0.05:
        mood = 'sad'
    else:
        mood = 'neutral'
    return jsonify({
        'mood':     mood,
        **scores
    })

@app.route('/entry', methods=['POST'])
def save_entry():
    data = request.json or {}
    entry_text = data.get('entry', '')
    # reuse analyzer
    scores = analyzer.polarity_scores(entry_text)
    comp = scores['compound']
    if comp >= 0.05:
        mood = 'happy'
    elif comp <= -0.05:
        mood = 'sad'
    else:
        mood = 'neutral'
    e = Entry(
        text     = entry_text,
        mood     = mood,
        neg      = scores['neg'],
        neu      = scores['neu'],
        pos      = scores['pos'],
        compound = comp
    )
    db.session.add(e)
    db.session.commit()
    return jsonify(e.to_dict()), 201

@app.route('/entries', methods=['GET'])
def get_entries():
    all_entries = Entry.query.order_by(Entry.timestamp).all()
    return jsonify([e.to_dict() for e in all_entries])

@app.route('/recommend', methods=['POST'])
def recommend():
    data = request.json or {}
    mood = data.get('mood', '').lower()
    previous = data.get('habits', [])

    mood_recs = {
        'happy': [
            'Share gratitude with a friend',
            'Try a new creative hobby',
            'Do 10 minutes of stretching'
        ],
        'neutral': [
            'Take a 5-minute mindfulness break',
            'Drink a glass of water',
            'Go for a short walk'
        ],
        'sad': [
            'Write down one thing you’re grateful for',
            'Do 5 minutes of deep breathing',
            'Call or text someone you trust'
        ]
    }
    default = ['Track today’s habits', 'Review yesterday’s journal']
    recs = [h for h in mood_recs.get(mood, default) if h not in previous]
    return jsonify({'recommendations': recs})

@app.route('/prompt', methods=['POST'])
def prompt():
    mood = request.json.get('mood', 'neutral')
    print(f"[DEBUG] /prompt called with mood={mood!r}")
    print(f"[DEBUG] openai.api_key is {openai.api_key!r}")

    system  = (
        "You are a gentle journaling coach in a fantasy forest. "
        "Given the user's mood, suggest a single open-ended journaling prompt."
    )
    user_msg = f"My mood today is: {mood}. Give me one thoughtful journaling question."

    try:
        # ← here’s the v1.0+ syntax, no extra client instance needed
        resp = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system},
                {"role": "user",   "content": user_msg}
            ],
            max_tokens=50,
            temperature=0.8
        )
        prompt_text = resp.choices[0].message.content.strip()

    except Exception as e:
        print("[DEBUG] OpenAI error:", repr(e))
        fallback = {
            "happy":   "What recent success are you most proud of, and why?",
            "neutral": "What's something small you noticed today that you might explore further?",
            "sad":     "What is one kind thing you can offer yourself right now?"
        }
        prompt_text = fallback.get(mood)

    # (save to DB, return as before…)
    p = Prompt(text=prompt_text, mood=mood)
    db.session.add(p)
    db.session.commit()

    return jsonify({"prompt": prompt_text, "prompt_id": p.id})


@app.route('/prompt-history', methods=['GET'])
def prompt_history():
    prompts = Prompt.query.order_by(Prompt.timestamp.desc()).all()
    return jsonify([
        {
            "id":        p.id,
            "text":      p.text,
            "mood":      p.mood,
            "timestamp": p.timestamp.isoformat()
        }
        for p in prompts
    ])

@app.route('/feedback', methods=['POST'])
def feedback():
    data = request.json or {}
    fid   = data.get('prompt_id')
    up    = data.get('feedback') == 'up'
    f = Feedback(prompt_id=fid, feedback=up)
    db.session.add(f)
    db.session.commit()
    return jsonify({"status": "ok"})

@app.route('/last-prompt', methods=['GET'])
def last_prompt():
    p = Prompt.query.order_by(Prompt.timestamp.desc()).first()
    if not p:
        return jsonify({}), 404
    return jsonify({
        "id":        p.id,
        "text":      p.text,
        "mood":      p.mood,
        "timestamp": p.timestamp.isoformat()
    })

if __name__ == '__main__':
    app.run(debug=True)
