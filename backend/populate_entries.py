#!/usr/bin/env python3
# backend/populate_entries.py

from datetime import datetime, timedelta
import random

# import your Flask app, DB, model & analyzer
from app import app, db, Entry, analyzer

# A small pool of example journal lines
SAMPLES = [
    "I had a wonderful walk in the park today.",
    "Work was stressful, but I managed to get through.",
    "I feel grateful for my friends and family.",
    "I’m a bit tired and overwhelmed.",
    "Today was a neutral day—nothing special happened.",
    "I accomplished a lot and feel proud!",
    "I’m feeling anxious about next week’s presentation.",
    "I had a relaxing evening reading a good book.",
    "I feel hopeful about the future.",
    "I had an argument, and now I feel sad."
]

def seed_entries(start_date, end_date):
    with app.app_context():
        date = start_date
        while date <= end_date:
            text = random.choice(SAMPLES)
            scores = analyzer.polarity_scores(text)
            comp = scores['compound']
            if comp >=  0.05:
                mood = 'happy'
            elif comp <= -0.05:
                mood = 'sad'
            else:
                mood = 'neutral'

            entry = Entry(
                text      = text,
                mood      = mood,
                neg       = scores['neg'],
                neu       = scores['neu'],
                pos       = scores['pos'],
                compound  = comp,
                timestamp = date
            )
            db.session.add(entry)
            date += timedelta(days=1)

        db.session.commit()
        print(f"Seeded entries from {start_date.date()} to {end_date.date()}")

if __name__ == '__main__':
    start = datetime(2024, 10, 1)
    end   = datetime(2025, 6, 30)
    seed_entries(start, end)
