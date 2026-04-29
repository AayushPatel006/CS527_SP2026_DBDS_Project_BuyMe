from flask import Flask, jsonify, request
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from datetime import datetime, timezone
from werkzeug.security import check_password_hash, generate_password_hash
import json
import os
import re
from pathlib import Path
from urllib import error as urllib_error
from urllib import request as urllib_request
from dotenv import load_dotenv


BACKEND_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BACKEND_DIR.parent

load_dotenv(PROJECT_ROOT / ".env", override=True)
load_dotenv(BACKEND_DIR / ".env", override=True)

app = Flask(__name__)

# Update these with your MySQL credentials
DB_USER = "user"
DB_PASSWORD = "pwd"
DB_HOST = "localhost"
DB_PORT = "3306"
DB_NAME = "buyme"


DATABASE_URL = (
    f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
)

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
GEMINI_API_KEY = (os.getenv("GEMINI_API_KEY") or "").strip().strip('"').strip("'") or None
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
masked_key = "No"
if GEMINI_API_KEY:
    suffix = GEMINI_API_KEY[-6:] if len(GEMINI_API_KEY) >= 6 else GEMINI_API_KEY
    masked_key = f"Yes (...{suffix}, len={len(GEMINI_API_KEY)})"
print(f"Gemini API Key Loaded: {'Yes' if GEMINI_API_KEY else 'No'}")
print(f"Gemini Model Loaded: {'Yes' if GEMINI_MODEL else 'No'}")
print(f"Gemini API Key Fingerprint: {masked_key}")


def _to_float(value):
    return float(value) if value is not None else None


def _serialize_item_row(row):
    return {
        "id": row.id,
        "seller_id": row.seller_id,
        "category_id": row.category_id,
        "title": row.title,
        "description": row.description,
        "starting_price": _to_float(row.starting_price),
        "reserve_price": _to_float(row.reserve_price),
        "bid_increment": _to_float(row.bid_increment),
        "closes_at": row.closes_at.isoformat() if row.closes_at else None,
        "status": row.status,
        "created_at": row.created_at.isoformat() if row.created_at else None,
        "current_bid": _to_float(row.current_bid),
        "bid_count": row.bid_count,
        "seller_username": row.seller_username,
        "category_name": row.category_name,
        "image_url": getattr(row, "image_url", None),
    }


def _fetch_item_field_values(conn, item_id):
    result = conn.execute(
        text(
            """
            SELECT cf.field_name, ifv.value
            FROM item_field_values ifv
            JOIN category_fields cf ON cf.id = ifv.category_field_id
            WHERE ifv.item_id = :item_id
            ORDER BY cf.id
            """
        ),
        {"item_id": item_id},
    )
    rows = result.fetchall()
    return {row.field_name: row.value for row in rows}


def _parse_datetime_input(value):
    parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    if parsed.tzinfo is not None:
        parsed = parsed.astimezone(timezone.utc).replace(tzinfo=None)
    return parsed


def _category_ancestor_ids(conn, category_id):
    ids = []
    current_id = category_id
    while current_id is not None:
        ids.append(current_id)
        row = conn.execute(
            text("SELECT parent_id FROM category WHERE id = :category_id"),
            {"category_id": current_id},
        ).fetchone()
        if not row:
            break
        current_id = row.parent_id
    return ids


def _serialize_category_row(row):
    return {
        "id": row.id,
        "name": row.name,
        "parent_id": row.parent_id,
        "level": row.level,
    }


def _serialize_category_field_row(row):
    return {
        "id": row.id,
        "category_id": row.category_id,
        "field_name": row.field_name,
        "field_type": row.field_type,
        "is_required": bool(row.is_required),
    }


def _serialize_user_row(row):
    return {
        "id": row.id,
        "username": row.username,
        "email": row.email,
        "role": row.role,
        "is_active": bool(row.is_active),
        "created_at": row.created_at.isoformat() if row.created_at else None,
    }


def _serialize_question_row(row):
    return {
        "id": row.id,
        "user_id": row.user_id,
        "item_id": row.item_id,
        "rep_id": row.rep_id,
        "question_text": row.question_text,
        "answer_text": row.answer_text,
        "asked_at": row.asked_at.isoformat() if row.asked_at else None,
        "answered_at": row.answered_at.isoformat() if row.answered_at else None,
        "user_username": getattr(row, "user_username", None),
        "rep_username": getattr(row, "rep_username", None),
        "item_title": getattr(row, "item_title", None),
    }


def _serialize_notification_row(row):
    return {
        "id": row.id,
        "user_id": row.user_id,
        "item_id": row.item_id,
        "type": row.type,
        "message": row.message,
        "is_read": bool(row.is_read),
        "created_at": row.created_at.isoformat() if row.created_at else None,
    }


def _demo_user_password_hash():
    return generate_password_hash("demo123", method="pbkdf2:sha256")


def _password_matches(stored_password_hash, provided_password):
    if not stored_password_hash:
        return False
    if stored_password_hash.startswith("pbkdf2:") or stored_password_hash.startswith("scrypt:"):
        return check_password_hash(stored_password_hash, provided_password)

    return stored_password_hash == provided_password


def _fetch_item_with_stats(conn, item_id):
    row = conn.execute(
        text(
            """
            SELECT
                i.id,
                i.seller_id,
                i.category_id,
                i.title,
                i.image_url,
                i.description,
                i.starting_price,
                i.reserve_price,
                i.bid_increment,
                i.closes_at,
                i.status,
                i.created_at,
                u.username AS seller_username,
                c.name AS category_name,
                MAX(b.amount) AS current_bid,
                COUNT(b.id) AS bid_count
            FROM items i
            JOIN users u ON u.id = i.seller_id
            JOIN category c ON c.id = i.category_id
            LEFT JOIN bids b ON b.item_id = i.id AND b.removed_at IS NULL
            WHERE i.id = :item_id
            GROUP BY
                i.id, i.seller_id, i.category_id, i.title, i.description,
                i.image_url, i.starting_price, i.reserve_price, i.bid_increment, i.closes_at,
                i.status, i.created_at, u.username, c.name
            """
        ),
        {"item_id": item_id},
    ).fetchone()
    return row


def _fetch_active_items_for_assistant(conn):
    rows = conn.execute(
        text(
            """
            SELECT
                i.id,
                i.seller_id,
                i.category_id,
                i.title,
                i.image_url,
                i.description,
                i.starting_price,
                i.reserve_price,
                i.bid_increment,
                i.closes_at,
                i.status,
                i.created_at,
                u.username AS seller_username,
                c.name AS category_name,
                MAX(b.amount) AS current_bid,
                COUNT(b.id) AS bid_count
            FROM items i
            JOIN users u ON u.id = i.seller_id
            JOIN category c ON c.id = i.category_id
            LEFT JOIN bids b ON b.item_id = i.id AND b.removed_at IS NULL
            WHERE i.status = 'active' AND i.closes_at > NOW()
            GROUP BY
                i.id, i.seller_id, i.category_id, i.title, i.description,
                i.image_url, i.starting_price, i.reserve_price, i.bid_increment, i.closes_at,
                i.status, i.created_at, u.username, c.name
            ORDER BY i.closes_at ASC
            """
        )
    ).fetchall()

    items = []
    for row in rows:
        item = _serialize_item_row(row)
        item["field_values"] = _fetch_item_field_values(conn, item["id"])
        items.append(item)
    return items


def _assistant_extract_number(match):
    if not match:
        return None
    try:
        return float(match.group(1).replace(",", ""))
    except (ValueError, IndexError):
        return None


def _assistant_extract_year(item):
    field_year = (item.get("field_values") or {}).get("Year")
    if field_year:
        try:
            return int(field_year)
        except (TypeError, ValueError):
            pass

    title = item.get("title") or ""
    match = re.search(r"\b(19\d{2}|20\d{2})\b", title)
    if match:
        return int(match.group(1))
    return None


def _assistant_parse_query(query_text):
    text_value = (query_text or "").strip()
    lowered = text_value.lower()

    budget = None
    for pattern in (
        r"budget(?: of| is| around| up to)?\s*\$?([\d,]+(?:\.\d+)?)",
        r"under\s+\$?([\d,]+(?:\.\d+)?)",
        r"within\s+\$?([\d,]+(?:\.\d+)?)",
        r"max(?:imum)?\s+\$?([\d,]+(?:\.\d+)?)",
        r"\$([\d,]+(?:\.\d+)?)",
    ):
        match = re.search(pattern, lowered)
        budget = _assistant_extract_number(match)
        if budget is not None:
            break

    min_year = None
    for pattern in (
        r"not older(?:\s+older)?\s+th(?:an|at)\s+(19\d{2}|20\d{2})",
        r"not older than\s+(19\d{2}|20\d{2})",
        r"no older than\s+(19\d{2}|20\d{2})",
        r"newer than\s+(19\d{2}|20\d{2})",
        r"at least\s+(19\d{2}|20\d{2})",
        r"from\s+(19\d{2}|20\d{2})",
    ):
        match = re.search(pattern, lowered)
        if match:
            min_year = int(match.group(1))
            if "newer than" in pattern:
                min_year += 1
            break

    category_map = {
        "sedan": ["sedan", "sedans"],
        "suv": ["suv", "suvs"],
        "sports car": ["sports car", "sports cars"],
        "pickup truck": ["pickup truck", "pickup trucks"],
        "truck": ["truck", "trucks"],
        "motorcycle": ["motorcycle", "motorcycles"],
        "sport bike": ["sport bike", "sport bikes"],
        "cruiser": ["cruiser", "cruisers"],
        "car": ["car", "cars"],
        "other": ["other"],
    }

    requested_categories = []
    for canonical, aliases in category_map.items():
        if any(alias in lowered for alias in aliases):
            requested_categories.append(canonical)

    return {
        "query": text_value,
        "budget": budget,
        "min_year": min_year,
        "categories": requested_categories,
    }


def _assistant_parse_query_with_gemini(query_text):
    if not GEMINI_API_KEY:
        raise RuntimeError("GEMINI_API_KEY is not configured on the backend")

    prompt = (
        "You extract bidding constraints from a user query for a vehicle auction site. "
        "Return only structured JSON that follows the schema. "
        "Interpret informal phrasing and minor typos. "
        "Normalize category terms to short labels such as sedan, suv, sports car, pickup truck, truck, motorcycle, sport bike, cruiser, car, other. "
        "If a value is missing, use 0 for numbers, false for booleans, and [] for arrays.\n\n"
        f"User query: {query_text}"
    )

    request_body = {
        "contents": [
            {
                "role": "user",
                "parts": [{"text": prompt}],
            }
        ],
        "generationConfig": {
            "temperature": 0.1,
            "responseMimeType": "application/json",
            "responseSchema": {
                "type": "object",
                "properties": {
                    "budgetMax": {"type": "number"},
                    "minYear": {"type": "integer"},
                    "categories": {
                        "type": "array",
                        "items": {"type": "string"},
                    },
                    "strictBudget": {"type": "boolean"},
                    "intentSummary": {"type": "string"},
                },
                "required": ["budgetMax", "minYear", "categories", "strictBudget", "intentSummary"],
            },
        },
    }

    req = urllib_request.Request(
        f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent",
        data=json.dumps(request_body).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "x-goog-api-key": GEMINI_API_KEY,
        },
        method="POST",
    )

    try:
        with urllib_request.urlopen(req, timeout=20) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except urllib_error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="ignore")
        raise RuntimeError(f"Gemini API request failed: {detail or exc.reason}") from exc
    except urllib_error.URLError as exc:
        raise RuntimeError(f"Gemini API network error: {exc.reason}") from exc

    candidates = payload.get("candidates") or []
    if not candidates:
        prompt_feedback = payload.get("promptFeedback") or {}
        block_reason = prompt_feedback.get("blockReason")
        if block_reason:
            raise RuntimeError(f"Gemini blocked the request: {block_reason}")
        raise RuntimeError("Gemini returned no candidates")

    parts = ((candidates[0].get("content") or {}).get("parts")) or []
    text_part = "".join(part.get("text", "") for part in parts if part.get("text"))
    if not text_part:
        raise RuntimeError("Gemini returned an empty response")

    try:
        extracted = json.loads(text_part)
    except json.JSONDecodeError as exc:
        raise RuntimeError("Gemini returned invalid JSON for assistant planning") from exc

    categories = [str(value).strip().lower() for value in extracted.get("categories", []) if str(value).strip()]
    budget_max = extracted.get("budgetMax") or 0
    min_year = extracted.get("minYear") or 0

    return {
        "query": query_text.strip(),
        "budget": float(budget_max) if budget_max else None,
        "min_year": int(min_year) if min_year else None,
        "categories": categories,
        "strict_budget": bool(extracted.get("strictBudget")),
        "summary": str(extracted.get("intentSummary") or "").strip(),
    }


def _assistant_score_item(item, intent):
    text_blob = " ".join(
        [
            str(item.get("title") or ""),
            str(item.get("description") or ""),
            str(item.get("category_name") or ""),
            " ".join(f"{k} {v}" for k, v in (item.get("field_values") or {}).items()),
        ]
    ).lower()

    year = _assistant_extract_year(item)
    min_bid = (item.get("current_bid") or item.get("starting_price") or 0) + (item.get("bid_increment") or 0)

    meets_category = not intent["categories"]
    matched_categories = []
    if intent["categories"]:
        for category in intent["categories"]:
            if category in text_blob:
                matched_categories.append(category)
        meets_category = len(matched_categories) > 0

    meets_year = intent["min_year"] is None or (year is not None and year >= intent["min_year"])
    meets_budget = intent["budget"] is None or min_bid <= intent["budget"]

    score = 0.0
    if intent["categories"]:
        score += 40 if meets_category else -35
        score += min(10, len(matched_categories) * 5)
    else:
        score += 10

    if intent["min_year"] is not None:
        if meets_year:
            score += 30
        elif year is not None:
            score -= 45 + max(0, intent["min_year"] - year) * 0.5
        else:
            score -= 12

    if intent["budget"] is not None:
        gap = intent["budget"] - min_bid
        if gap >= 0:
            score += 35
            score += min(10, gap / 500)
        else:
            score -= min(45, abs(gap) / 200)
    else:
        score += 15

    score += min(10, (item.get("bid_count") or 0) * 0.75)

    return {
        "score": score,
        "min_bid": round(min_bid, 2),
        "year": year,
        "meets_category": meets_category,
        "meets_year": meets_year,
        "meets_budget": meets_budget,
        "matched_categories": matched_categories,
    }


def _assistant_build_explanation(intent, match_info, item):
    parts = []
    quality = "exact" if (
        match_info["meets_category"] and match_info["meets_year"] and match_info["meets_budget"]
    ) else "closest"

    if quality == "exact":
        parts.append("This is the best live match for your request.")
    else:
        parts.append("This is the closest live match I found.")

    if match_info["matched_categories"]:
        pretty_categories = ", ".join(match_info["matched_categories"])
        parts.append(f"It matches your requested type: {pretty_categories}.")

    if intent["min_year"] is not None:
        if match_info["year"] is not None and match_info["meets_year"]:
            parts.append(f"It meets your year requirement with a {match_info['year']} model.")
        elif match_info["year"] is not None:
            parts.append(f"It is a {match_info['year']} model, so it misses your year target of {intent['min_year']}.")

    if intent["budget"] is not None:
        if match_info["meets_budget"]:
            parts.append(f"The next valid bid is ${match_info['min_bid']:,.2f}, which fits within your ${intent['budget']:,.2f} budget.")
        else:
            parts.append(f"The next valid bid is ${match_info['min_bid']:,.2f}, which is above your ${intent['budget']:,.2f} budget.")
    else:
        parts.append(f"The next valid bid is ${match_info['min_bid']:,.2f}.")

    parts.append(f"Recommended item: {item['title']}.")
    return " ".join(parts), quality


def get_user_ids():
    try:
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT id, username
                FROM users
            """))
            rows = result.fetchall()
            return {row.username: row.id for row in rows}
    except Exception as e:
        raise Exception(f"Error fetching user ids: {e}")


def get_item_ids():
    try:
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT id, title
                FROM items
            """))
            rows = result.fetchall()
            return {row.title: row.id for row in rows}
    except Exception as e:
        raise Exception(f"Error fetching item ids: {e}")


def seed_users():
    password_hash = _demo_user_password_hash()
    query = text("""
        INSERT IGNORE INTO users (username, email, password_hash, role) VALUES
        ('admin', 'admin@buyme.com', :password_hash, 'admin'),
        ('john_seller', 'john@example.com', :password_hash, 'seller'),
        ('jane_buyer', 'jane@example.com', :password_hash, 'buyer'),
        ('rep_mike', 'mike@buyme.com', :password_hash, 'rep'),
        ('alice_buyer', 'alice@example.com', :password_hash, 'buyer'),
        ('bob_seller', 'bob@example.com', :password_hash, 'seller'),
        ('charlie_buyer', 'charlie@example.com', :password_hash, 'buyer'),
        ('david_buyer', 'david@example.com', :password_hash, 'buyer'),
        ('emma_seller', 'emma@example.com', :password_hash, 'seller'),
        ('olivia_buyer', 'olivia@example.com', :password_hash, 'buyer')
    """)

    update_query = text("""
        UPDATE users
        SET password_hash = :password_hash
        WHERE username IN (
            'admin', 'john_seller', 'jane_buyer', 'rep_mike', 'alice_buyer',
            'bob_seller', 'charlie_buyer', 'david_buyer', 'emma_seller', 'olivia_buyer'
        )
    """)

    with engine.begin() as conn:
        conn.execute(query, {"password_hash": password_hash})
        conn.execute(update_query, {"password_hash": password_hash})

    return {"message": "Users seeded successfully"}


def insert_categories():
    query = text("""
        INSERT IGNORE INTO category (id, name, parent_id, level) VALUES
        (1, 'Vehicles', NULL, 'root'),
        (2, 'Cars', 1, 'sub'),
        (3, 'Trucks', 1, 'sub'),
        (4, 'Motorcycles', 1, 'sub'),
        (5, 'Sedans', 2, 'leaf'),
        (6, 'SUVs', 2, 'leaf'),
        (7, 'Sports Cars', 2, 'leaf'),
        (8, 'Pickup Trucks', 3, 'leaf'),
        (9, 'Cruisers', 4, 'leaf'),
        (10, 'Sport Bikes', 4, 'leaf'),
        (11, 'Other', NULL, 'leaf')
    """)

    with engine.begin() as conn:
        conn.execute(query)

    return {"message": "Categories inserted successfully"}


def insert_category_fields():
    query = text("""
        INSERT IGNORE INTO category_fields (category_id, field_name, field_type, is_required) VALUES
        (1, 'Year', 'number', TRUE),
        (1, 'Make', 'text', TRUE),
        (1, 'Model', 'text', TRUE),
        (1, 'Mileage', 'number', TRUE),
        (1, 'Color', 'text', FALSE),
        (2, 'Transmission', 'text', TRUE),
        (2, 'Fuel Type', 'text', TRUE),
        (4, 'Engine Size (cc)', 'number', TRUE)
    """)

    with engine.begin() as conn:
        conn.execute(query)

    return {"message": "Category fields inserted successfully"}


def insert_items():
    user_ids = get_user_ids()

    john = user_ids["john_seller"]
    bob = user_ids["bob_seller"]
    emma = user_ids["emma_seller"]

    query = text("""
        INSERT IGNORE INTO items
        (seller_id, category_id, title, description, starting_price, reserve_price, bid_increment, closes_at)
        VALUES
        (:john,5,'2020 Honda Civic','Reliable sedan',15000,17000,100, DATE_ADD(NOW(), INTERVAL 5 DAY)),
        (:bob,5,'2019 Toyota Corolla','Fuel efficient',14000,16000,100, DATE_ADD(NOW(), INTERVAL 6 DAY)),
        (:emma,5,'2021 Hyundai Elantra','Modern sedan',16000,18000,100, DATE_ADD(NOW(), INTERVAL 4 DAY)),
        (:john,5,'2018 Nissan Altima','Comfortable ride',13000,15000,100, DATE_ADD(NOW(), INTERVAL 7 DAY)),
        (:bob,5,'2022 Kia Forte','Like new',17000,19000,100, DATE_ADD(NOW(), INTERVAL 3 DAY)),

        (:john,6,'2021 Toyota RAV4','Hybrid SUV',28000,30000,200, DATE_ADD(NOW(), INTERVAL 5 DAY)),
        (:emma,6,'2020 Honda CR-V','Spacious SUV',26000,28000,200, DATE_ADD(NOW(), INTERVAL 6 DAY)),
        (:bob,6,'2019 Ford Escape','Compact SUV',22000,24000,200, DATE_ADD(NOW(), INTERVAL 4 DAY)),
        (:john,6,'2022 Tesla Model Y','Electric SUV',45000,48000,500, DATE_ADD(NOW(), INTERVAL 7 DAY)),
        (:emma,6,'2021 BMW X5','Luxury SUV',50000,55000,500, DATE_ADD(NOW(), INTERVAL 3 DAY)),

        (:john,7,'2022 Porsche 911','Sports car',85000,95000,500, DATE_ADD(NOW(), INTERVAL 3 DAY)),
        (:bob,7,'2021 Corvette C8','American muscle',70000,75000,500, DATE_ADD(NOW(), INTERVAL 5 DAY)),
        (:emma,7,'2020 Audi R8','Luxury performance',120000,130000,1000, DATE_ADD(NOW(), INTERVAL 6 DAY)),
        (:john,7,'2019 Nissan GT-R','Supercar',90000,100000,500, DATE_ADD(NOW(), INTERVAL 4 DAY)),
        (:bob,7,'2022 BMW M4','Sport coupe',65000,70000,500, DATE_ADD(NOW(), INTERVAL 7 DAY)),

        (:john,8,'2023 Ford F-150','Pickup truck',48000,52000,500, DATE_ADD(NOW(), INTERVAL 2 DAY)),
        (:bob,8,'2022 RAM 1500','Powerful truck',46000,50000,500, DATE_ADD(NOW(), INTERVAL 5 DAY)),
        (:emma,8,'2021 Chevy Silverado','Durable truck',44000,48000,500, DATE_ADD(NOW(), INTERVAL 6 DAY)),
        (:john,8,'2020 Toyota Tacoma','Reliable truck',38000,42000,300, DATE_ADD(NOW(), INTERVAL 4 DAY)),
        (:bob,8,'2019 Ford Ranger','Mid-size truck',35000,38000,300, DATE_ADD(NOW(), INTERVAL 7 DAY)),

        (:john,9,'2019 Harley Road King','Cruiser bike',15000,17000,200, DATE_ADD(NOW(), INTERVAL 2 DAY)),
        (:bob,9,'2020 Indian Chief','Classic cruiser',16000,18000,200, DATE_ADD(NOW(), INTERVAL 5 DAY)),
        (:emma,9,'2021 Yamaha V-Star','Smooth ride',9000,11000,100, DATE_ADD(NOW(), INTERVAL 6 DAY)),
        (:john,9,'2018 Suzuki Boulevard','Affordable cruiser',8000,10000,100, DATE_ADD(NOW(), INTERVAL 4 DAY)),
        (:bob,9,'2022 Honda Rebel','Modern cruiser',9500,11500,100, DATE_ADD(NOW(), INTERVAL 7 DAY)),

        (:john,10,'2021 Kawasaki Ninja','Sport bike',8500,9500,100, DATE_ADD(NOW(), INTERVAL 4 DAY)),
        (:bob,10,'2020 Yamaha R6','Track bike',12000,14000,200, DATE_ADD(NOW(), INTERVAL 5 DAY)),
        (:emma,10,'2022 Ducati Panigale','Superbike',20000,23000,500, DATE_ADD(NOW(), INTERVAL 6 DAY)),
        (:john,10,'2019 Suzuki GSX-R','Performance bike',11000,13000,200, DATE_ADD(NOW(), INTERVAL 3 DAY)),
        (:bob,10,'2021 BMW S1000RR','High-end bike',22000,25000,500, DATE_ADD(NOW(), INTERVAL 7 DAY))
    """)

    with engine.begin() as conn:
        conn.execute(query, {
            "john": john,
            "bob": bob,
            "emma": emma
        })

    return {"message": "Items inserted successfully"}


def insert_bids():
    user_ids = get_user_ids()
    item_ids = get_item_ids()

    jane = user_ids["jane_buyer"]
    alice = user_ids["alice_buyer"]
    charlie = user_ids["charlie_buyer"]
    david = user_ids["david_buyer"]

    civic = item_ids["2020 Honda Civic"]
    rav4 = item_ids["2021 Toyota RAV4"]
    porsche = item_ids["2022 Porsche 911"]

    query = text("""
        INSERT IGNORE INTO bids (item_id, bidder_id, amount, is_auto)
        VALUES
        (:civic,:jane,15500,FALSE),
        (:civic,:alice,16000,FALSE),
        (:civic,:jane,17000,TRUE),
        (:rav4,:charlie,28500,FALSE),
        (:rav4,:david,29500,FALSE),
        (:porsche,:jane,90000,FALSE)
    """)

    with engine.begin() as conn:
        conn.execute(query, {
            "civic": civic,
            "rav4": rav4,
            "porsche": porsche,
            "jane": jane,
            "alice": alice,
            "charlie": charlie,
            "david": david
        })

    return {"message": "Bids inserted successfully"}


def insert_and_update_questions():
    user_ids = get_user_ids()
    item_ids = get_item_ids()

    jane = user_ids["jane_buyer"]
    alice = user_ids["alice_buyer"]
    rep = user_ids["rep_mike"]

    civic = item_ids["2020 Honda Civic"]
    tesla = item_ids["2022 Tesla Model Y"]

    insert_query = text("""
        INSERT IGNORE INTO questions (user_id, item_id, question_text)
        VALUES
        (:jane,:civic,'Has this car been in any accidents?'),
        (:alice,:tesla,'Is the battery still under warranty?')
    """)

    update_query = text("""
        UPDATE questions
        SET rep_id = :rep,
            answer_text = 'Yes, full warranty available.',
            answered_at = NOW()
        WHERE item_id = :tesla
          AND user_id = :alice
          AND question_text = 'Is the battery still under warranty?'
    """)

    with engine.begin() as conn:
        conn.execute(insert_query, {
            "jane": jane,
            "alice": alice,
            "civic": civic,
            "tesla": tesla
        })
        conn.execute(update_query, {
            "rep": rep,
            "tesla": tesla,
            "alice": alice
        })

    return {"message": "Questions inserted and updated successfully"}


def insert_notifications():
    user_ids = get_user_ids()
    item_ids = get_item_ids()

    jane = user_ids["jane_buyer"]
    alice = user_ids["alice_buyer"]

    civic = item_ids["2020 Honda Civic"]
    harley = item_ids["2019 Harley Road King"]

    query = text("""
        INSERT IGNORE INTO notifications (user_id, item_id, type, message)
        VALUES
        (:jane,:civic,'outbid','You have been outbid on Honda Civic'),
        (:alice,:civic,'auto_limit_exceeded','Your auto bid limit exceeded'),
        (:jane,:harley,'auction_won','You won the Harley Road King')
    """)

    with engine.begin() as conn:
        conn.execute(query, {
            "jane": jane,
            "alice": alice,
            "civic": civic,
            "harley": harley
        })

    return {"message": "Notifications inserted successfully"}


@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "BuyMe API is running"}), 200


@app.route("/api/auth/login", methods=["POST"])
def api_auth_login():
    payload = request.get_json(silent=True) or {}
    username = (payload.get("username") or "").strip()
    password = payload.get("password") or ""

    if not username or not password:
        return jsonify({"error": "username and password are required"}), 400

    try:
        with engine.connect() as conn:
            user_row = conn.execute(
                text(
                    """
                    SELECT id, username, email, password_hash, role, is_active, created_at, deleted_at
                    FROM users
                    WHERE username = :username
                    LIMIT 1
                    """
                ),
                {"username": username},
            ).fetchone()

            if not user_row or user_row.deleted_at is not None:
                return jsonify({"error": "Invalid username or password"}), 401

            if not user_row.is_active:
                return jsonify({"error": "Account is inactive"}), 403

            if not _password_matches(user_row.password_hash, password):
                return jsonify({"error": "Invalid username or password"}), 401

            return jsonify(_serialize_user_row(user_row)), 200
    except SQLAlchemyError as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500


@app.route("/api/auth/register", methods=["POST"])
def api_auth_register():
    payload = request.get_json(silent=True) or {}
    username = (payload.get("username") or "").strip()
    email = (payload.get("email") or "").strip().lower()
    password = payload.get("password") or ""
    role = (payload.get("role") or "buyer").strip().lower()

    if not username or not email or not password:
        return jsonify({"error": "username, email, and password are required"}), 400

    if len(password) < 6:
        return jsonify({"error": "password must be at least 6 characters"}), 400

    if role not in {"buyer", "seller"}:
        return jsonify({"error": "role must be buyer or seller"}), 400

    password_hash = generate_password_hash(password, method="pbkdf2:sha256")

    try:
        with engine.begin() as conn:
            existing = conn.execute(
                text(
                    """
                    SELECT id
                    FROM users
                    WHERE username = :username OR email = :email
                    LIMIT 1
                    """
                ),
                {"username": username, "email": email},
            ).fetchone()
            if existing:
                return jsonify({"error": "Username or email already exists"}), 409

            result = conn.execute(
                text(
                    """
                    INSERT INTO users (username, email, password_hash, role, is_active)
                    VALUES (:username, :email, :password_hash, :role, TRUE)
                    """
                ),
                {
                    "username": username,
                    "email": email,
                    "password_hash": password_hash,
                    "role": role,
                },
            )
            user_id = result.lastrowid

            user_row = conn.execute(
                text(
                    """
                    SELECT id, username, email, role, is_active, created_at
                    FROM users
                    WHERE id = :user_id
                    """
                ),
                {"user_id": user_id},
            ).fetchone()

            if not user_row:
                return jsonify({"error": "Failed to create user"}), 500

            return jsonify(_serialize_user_row(user_row)), 201
    except IntegrityError:
        return jsonify({"error": "Username or email already exists"}), 409
    except SQLAlchemyError as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500


@app.route("/api/stats/home", methods=["GET"])
def api_home_stats():
    try:
        with engine.connect() as conn:
            active_auctions = conn.execute(
                text(
                    """
                    SELECT COUNT(*) AS count
                    FROM items
                    WHERE status = 'active' AND closes_at > NOW()
                    """
                )
            ).scalar_one()

            verified_sellers = conn.execute(
                text("SELECT COUNT(*) AS count FROM users WHERE role = 'seller' AND is_active = TRUE AND deleted_at IS NULL")
            ).scalar_one()

            vehicles_listed = conn.execute(
                text("SELECT COUNT(*) AS count FROM items")
            ).scalar_one()

        return jsonify({
            "active_auctions": int(active_auctions or 0),
            "verified_sellers": int(verified_sellers or 0),
            "vehicles_listed": int(vehicles_listed or 0),
        }), 200
    except SQLAlchemyError as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500


@app.route("/api/admin/stats", methods=["GET"])
def api_admin_stats():
    try:
        with engine.connect() as conn:
            total_users = conn.execute(
                text("SELECT COUNT(*) FROM users WHERE deleted_at IS NULL")
            ).scalar_one()
            active_auctions = conn.execute(
                text(
                    """
                    SELECT COUNT(*)
                    FROM items
                    WHERE status = 'active' AND closes_at > NOW()
                    """
                )
            ).scalar_one()
            total_items = conn.execute(
                text("SELECT COUNT(*) FROM items")
            ).scalar_one()
            total_bids = conn.execute(
                text("SELECT COUNT(*) FROM bids WHERE removed_at IS NULL")
            ).scalar_one()
            sold_items = conn.execute(
                text(
                    """
                    SELECT COUNT(*)
                    FROM items
                    WHERE status <> 'cancelled'
                      AND (status = 'closed' OR closes_at <= NOW())
                    """
                )
            ).scalar_one()

        return jsonify({
            "total_users": int(total_users or 0),
            "active_auctions": int(active_auctions or 0),
            "total_items": int(total_items or 0),
            "total_bids": int(total_bids or 0),
            "sold_items": int(sold_items or 0),
        }), 200
    except SQLAlchemyError as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500


@app.route("/api/admin/users", methods=["GET"])
def api_admin_users():
    try:
        with engine.connect() as conn:
            rows = conn.execute(
                text(
                    """
                    SELECT id, username, email, role, is_active, created_at
                    FROM users
                    WHERE deleted_at IS NULL
                    ORDER BY created_at DESC, id DESC
                    """
                )
            ).fetchall()
            users = [_serialize_user_row(row) for row in rows]
        return jsonify(users), 200
    except SQLAlchemyError as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500


@app.route("/api/admin/reps", methods=["POST"])
def api_admin_create_rep():
    payload = request.get_json(silent=True) or {}
    username = (payload.get("username") or "").strip()
    email = (payload.get("email") or "").strip().lower()
    password = payload.get("password") or ""

    if not username or not email or not password:
        return jsonify({"error": "username, email, and password are required"}), 400

    if len(password) < 6:
        return jsonify({"error": "password must be at least 6 characters"}), 400

    password_hash = generate_password_hash(password, method="pbkdf2:sha256")

    try:
        with engine.begin() as conn:
            existing = conn.execute(
                text(
                    """
                    SELECT id
                    FROM users
                    WHERE username = :username OR email = :email
                    LIMIT 1
                    """
                ),
                {"username": username, "email": email},
            ).fetchone()
            if existing:
                return jsonify({"error": "Username or email already exists"}), 409

            result = conn.execute(
                text(
                    """
                    INSERT INTO users (username, email, password_hash, role, is_active)
                    VALUES (:username, :email, :password_hash, 'rep', TRUE)
                    """
                ),
                {
                    "username": username,
                    "email": email,
                    "password_hash": password_hash,
                },
            )
            user_id = result.lastrowid

            user_row = conn.execute(
                text(
                    """
                    SELECT id, username, email, role, is_active, created_at
                    FROM users
                    WHERE id = :user_id
                    """
                ),
                {"user_id": user_id},
            ).fetchone()

            return jsonify(_serialize_user_row(user_row)), 201
    except IntegrityError:
        return jsonify({"error": "Username or email already exists"}), 409
    except SQLAlchemyError as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500


@app.route("/api/admin/sales-report", methods=["GET"])
def api_admin_sales_report():
    try:
        with engine.connect() as conn:
            total_earnings = conn.execute(
                text(
                    """
                    SELECT COALESCE(SUM(s.final_price), 0)
                    FROM (
                        SELECT
                            i.id AS item_id,
                            COALESCE(
                                ar.final_price,
                                (
                                    SELECT b.amount
                                    FROM bids b
                                    WHERE b.item_id = i.id
                                      AND b.removed_at IS NULL
                                    ORDER BY b.amount DESC, b.placed_at DESC
                                    LIMIT 1
                                ),
                                0
                            ) AS final_price
                        FROM items i
                        LEFT JOIN auction_result ar ON ar.item_id = i.id
                        WHERE i.status <> 'cancelled'
                          AND (i.status = 'closed' OR i.closes_at <= NOW())
                    ) s
                    """
                )
            ).scalar_one()

            earnings_by_item_rows = conn.execute(
                text(
                    """
                    SELECT
                        i.title AS item_title,
                        COALESCE(
                            ar.final_price,
                            (
                                SELECT b.amount
                                FROM bids b
                                WHERE b.item_id = i.id
                                  AND b.removed_at IS NULL
                                ORDER BY b.amount DESC, b.placed_at DESC
                                LIMIT 1
                            ),
                            0
                        ) AS earnings
                    FROM items i
                    LEFT JOIN auction_result ar ON ar.item_id = i.id
                    WHERE i.status <> 'cancelled'
                      AND (i.status = 'closed' OR i.closes_at <= NOW())
                    ORDER BY earnings DESC, i.title ASC
                    """
                )
            ).fetchall()

            earnings_by_type_rows = conn.execute(
                text(
                    """
                    SELECT
                        c.name AS category_name,
                        COALESCE(
                            SUM(
                                COALESCE(
                                    ar.final_price,
                                    (
                                        SELECT b.amount
                                        FROM bids b
                                        WHERE b.item_id = i.id
                                          AND b.removed_at IS NULL
                                        ORDER BY b.amount DESC, b.placed_at DESC
                                        LIMIT 1
                                    ),
                                    0
                                )
                            ),
                            0
                        ) AS earnings
                    FROM items i
                    LEFT JOIN auction_result ar ON ar.item_id = i.id
                    JOIN category c ON c.id = i.category_id
                    WHERE i.status <> 'cancelled'
                      AND (i.status = 'closed' OR i.closes_at <= NOW())
                    GROUP BY c.name
                    ORDER BY earnings DESC, c.name ASC
                    """
                )
            ).fetchall()

            earnings_by_user_rows = conn.execute(
                text(
                    """
                    SELECT
                        u.username,
                        COALESCE(
                            SUM(
                                COALESCE(
                                    ar.final_price,
                                    (
                                        SELECT b.amount
                                        FROM bids b
                                        WHERE b.item_id = i.id
                                          AND b.removed_at IS NULL
                                        ORDER BY b.amount DESC, b.placed_at DESC
                                        LIMIT 1
                                    ),
                                    0
                                )
                            ),
                            0
                        ) AS earnings
                    FROM items i
                    LEFT JOIN auction_result ar ON ar.item_id = i.id
                    JOIN users u ON u.id = COALESCE(
                        ar.winner_id,
                        (
                            SELECT b.bidder_id
                            FROM bids b
                            WHERE b.item_id = i.id
                              AND b.removed_at IS NULL
                            ORDER BY b.amount DESC, b.placed_at DESC
                            LIMIT 1
                        )
                    )
                    WHERE i.status <> 'cancelled'
                      AND (i.status = 'closed' OR i.closes_at <= NOW())
                    GROUP BY u.username
                    ORDER BY earnings DESC, u.username ASC
                    """
                )
            ).fetchall()

            best_selling_items_rows = conn.execute(
                text(
                    """
                    SELECT i.title AS item_title, COUNT(*) AS sold_count
                    FROM items i
                    WHERE i.status <> 'cancelled'
                      AND (i.status = 'closed' OR i.closes_at <= NOW())
                    GROUP BY i.title
                    ORDER BY sold_count DESC, i.title ASC
                    """
                )
            ).fetchall()

            best_buyers_rows = conn.execute(
                text(
                    """
                    SELECT
                        u.username,
                        COALESCE(
                            SUM(
                                COALESCE(
                                    ar.final_price,
                                    (
                                        SELECT b.amount
                                        FROM bids b
                                        WHERE b.item_id = i.id
                                          AND b.removed_at IS NULL
                                        ORDER BY b.amount DESC, b.placed_at DESC
                                        LIMIT 1
                                    ),
                                    0
                                )
                            ),
                            0
                        ) AS total_spent
                    FROM items i
                    LEFT JOIN auction_result ar ON ar.item_id = i.id
                    JOIN users u ON u.id = COALESCE(
                        ar.winner_id,
                        (
                            SELECT b.bidder_id
                            FROM bids b
                            WHERE b.item_id = i.id
                              AND b.removed_at IS NULL
                            ORDER BY b.amount DESC, b.placed_at DESC
                            LIMIT 1
                        )
                    )
                    WHERE i.status <> 'cancelled'
                      AND (i.status = 'closed' OR i.closes_at <= NOW())
                    GROUP BY u.username
                    ORDER BY total_spent DESC, u.username ASC
                    """
                )
            ).fetchall()

        return jsonify({
            "total_earnings": float(total_earnings or 0),
            "earnings_by_item": [
                {"item_title": row.item_title, "earnings": float(row.earnings or 0)}
                for row in earnings_by_item_rows
            ],
            "earnings_by_type": [
                {"category_name": row.category_name, "earnings": float(row.earnings or 0)}
                for row in earnings_by_type_rows
            ],
            "earnings_by_user": [
                {"username": row.username, "earnings": float(row.earnings or 0)}
                for row in earnings_by_user_rows
            ],
            "best_selling_items": [
                {"item_title": row.item_title, "sold_count": int(row.sold_count or 0)}
                for row in best_selling_items_rows
            ],
            "best_buyers": [
                {"username": row.username, "total_spent": float(row.total_spent or 0)}
                for row in best_buyers_rows
            ],
        }), 200
    except SQLAlchemyError as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500


@app.route("/api/categories", methods=["GET"])
def api_list_categories():
    try:
        insert_categories()
        with engine.connect() as conn:
            rows = conn.execute(
                text("SELECT id, name, parent_id, level FROM category ORDER BY id")
            ).fetchall()
            categories = [_serialize_category_row(row) for row in rows]
        return jsonify(categories), 200
    except SQLAlchemyError as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500


@app.route("/api/categories/<int:category_id>/fields", methods=["GET"])
def api_category_fields(category_id):
    try:
        insert_categories()
        with engine.connect() as conn:
            exists = conn.execute(
                text("SELECT id FROM category WHERE id = :category_id"),
                {"category_id": category_id},
            ).fetchone()
            if not exists:
                return jsonify({"error": "Category not found"}), 404

            rows = conn.execute(
                text(
                    """
                    WITH RECURSIVE category_tree AS (
                        SELECT id, parent_id, 0 AS depth
                        FROM category
                        WHERE id = :category_id
                        UNION ALL
                        SELECT c.id, c.parent_id, ct.depth + 1
                        FROM category c
                        JOIN category_tree ct ON c.id = ct.parent_id
                    )
                    SELECT
                        cf.id,
                        cf.category_id,
                        cf.field_name,
                        cf.field_type,
                        cf.is_required
                    FROM category_fields cf
                    JOIN category_tree ct ON cf.category_id = ct.id
                    ORDER BY ct.depth DESC, cf.id
                    """
                ),
                {"category_id": category_id},
            ).fetchall()

            fields = [_serialize_category_field_row(row) for row in rows]
        return jsonify(fields), 200
    except SQLAlchemyError as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500


@app.route("/api/items", methods=["GET", "POST"])
def api_list_items():
    if request.method == "POST":
        payload = request.get_json(silent=True) or {}

        required_fields = [
            "seller_id",
            "category_id",
            "title",
            "description",
            "starting_price",
            "bid_increment",
            "closes_at",
        ]
        missing = [field for field in required_fields if payload.get(field) in (None, "")]
        if missing:
            return jsonify({"error": f"Missing required fields: {', '.join(missing)}"}), 400

        try:
            seller_id = int(payload["seller_id"])
            category_id = int(payload["category_id"])
            title = str(payload["title"]).strip()
            image_url = (payload.get("image_url") or "").strip() or None
            description = str(payload["description"]).strip()
            starting_price = float(payload["starting_price"])
            reserve_price = payload.get("reserve_price")
            reserve_price = float(reserve_price) if reserve_price not in (None, "") else None
            bid_increment = float(payload["bid_increment"])
            closes_at = _parse_datetime_input(str(payload["closes_at"]))
            field_values = payload.get("field_values") or {}
            if not isinstance(field_values, dict):
                return jsonify({"error": "field_values must be an object"}), 400
        except (TypeError, ValueError):
            return jsonify({"error": "Invalid payload types"}), 400

        if starting_price <= 0 or bid_increment <= 0:
            return jsonify({"error": "starting_price and bid_increment must be positive"}), 400

        if image_url and not (image_url.startswith("http://") or image_url.startswith("https://")):
            return jsonify({"error": "image_url must start with http:// or https://"}), 400

        if closes_at <= datetime.utcnow():
            return jsonify({"error": "closes_at must be in the future"}), 400

        try:
            insert_categories()
            with engine.begin() as conn:
                seller = conn.execute(
                    text("SELECT id, is_active FROM users WHERE id = :seller_id"),
                    {"seller_id": seller_id},
                ).fetchone()
                if not seller:
                    return jsonify({"error": "Seller not found"}), 404
                if not seller.is_active:
                    return jsonify({"error": "Seller account is inactive"}), 400

                category = conn.execute(
                    text("SELECT id FROM category WHERE id = :category_id"),
                    {"category_id": category_id},
                ).fetchone()
                if not category:
                    return jsonify({"error": "Category not found"}), 404

                insert_result = conn.execute(
                    text(
                        """
                        INSERT INTO items (
                            seller_id,
                            category_id,
                            title,
                            image_url,
                            description,
                            starting_price,
                            reserve_price,
                            bid_increment,
                            closes_at,
                            status
                        ) VALUES (
                            :seller_id,
                            :category_id,
                            :title,
                            :image_url,
                            :description,
                            :starting_price,
                            :reserve_price,
                            :bid_increment,
                            :closes_at,
                            'active'
                        )
                        """
                    ),
                    {
                        "seller_id": seller_id,
                        "category_id": category_id,
                        "title": title,
                        "image_url": image_url,
                        "description": description,
                        "starting_price": starting_price,
                        "reserve_price": reserve_price,
                        "bid_increment": bid_increment,
                        "closes_at": closes_at,
                    },
                )
                item_id = insert_result.lastrowid

                ancestor_ids = _category_ancestor_ids(conn, category_id)
                for field_name, value in field_values.items():
                    if value in (None, ""):
                        continue
                    category_field_id = None
                    for ancestor_id in ancestor_ids:
                        field_row = conn.execute(
                            text(
                                """
                                SELECT id
                                FROM category_fields
                                WHERE category_id = :category_id
                                  AND field_name = :field_name
                                LIMIT 1
                                """
                            ),
                            {"category_id": ancestor_id, "field_name": field_name},
                        ).fetchone()
                        if field_row:
                            category_field_id = field_row.id
                            break

                    if category_field_id is None:
                        continue

                    conn.execute(
                        text(
                            """
                            INSERT INTO item_field_values (item_id, category_field_id, value)
                            VALUES (:item_id, :category_field_id, :value)
                            """
                        ),
                        {
                            "item_id": item_id,
                            "category_field_id": category_field_id,
                            "value": str(value),
                        },
                    )

                created_row = _fetch_item_with_stats(conn, item_id)
                created_item = _serialize_item_row(created_row)
                created_item["field_values"] = _fetch_item_field_values(conn, item_id)

            return jsonify(created_item), 201
        except SQLAlchemyError as e:
            return jsonify({"error": f"Database error: {str(e)}"}), 500

    category_id = request.args.get("category_id", type=int)
    search = request.args.get("search", type=str)
    status = request.args.get("status", type=str)

    if status and status not in {"active", "closed", "cancelled"}:
        return jsonify({"error": "Invalid status filter"}), 400

    try:
        clauses = ["1=1"]
        params = {}

        if category_id is not None:
            clauses.append("i.category_id = :category_id")
            params["category_id"] = category_id

        if status:
            if status == "active":
                clauses.append("i.status = 'active' AND i.closes_at > NOW()")
            else:
                clauses.append("i.status = :status")
                params["status"] = status

        if search:
            clauses.append("(i.title LIKE :search OR i.description LIKE :search)")
            params["search"] = f"%{search.strip()}%"

        query = text(
            f"""
            SELECT
                i.id,
                i.seller_id,
                i.category_id,
                i.title,
                i.image_url,
                i.description,
                i.starting_price,
                i.reserve_price,
                i.bid_increment,
                i.closes_at,
                i.status,
                i.created_at,
                u.username AS seller_username,
                c.name AS category_name,
                MAX(b.amount) AS current_bid,
                COUNT(b.id) AS bid_count
            FROM items i
            JOIN users u ON u.id = i.seller_id
            JOIN category c ON c.id = i.category_id
            LEFT JOIN bids b ON b.item_id = i.id AND b.removed_at IS NULL
            WHERE {' AND '.join(clauses)}
            GROUP BY
                i.id, i.seller_id, i.category_id, i.title, i.description,
                i.image_url, i.starting_price, i.reserve_price, i.bid_increment, i.closes_at,
                i.status, i.created_at, u.username, c.name
            ORDER BY i.closes_at ASC
            """
        )

        with engine.connect() as conn:
            rows = conn.execute(query, params).fetchall()
            items = [_serialize_item_row(row) for row in rows]

        return jsonify(items), 200
    except SQLAlchemyError as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500


@app.route("/api/assistant/bid-plan", methods=["POST"])
def api_assistant_bid_plan():
    payload = request.get_json(silent=True) or {}
    query_text = (payload.get("query") or "").strip()

    if not query_text:
        return jsonify({"error": "query is required"}), 400

    try:
        with engine.connect() as conn:
            items = _fetch_active_items_for_assistant(conn)

        if not items:
            return jsonify({"error": "No active auctions are available right now"}), 404

        intent = _assistant_parse_query_with_gemini(query_text)
        ranked = []
        for item in items:
            match_info = _assistant_score_item(item, intent)
            ranked.append((item, match_info))

        ranked.sort(
            key=lambda entry: (
                int(entry[1]["meets_category"]) + int(entry[1]["meets_year"]) + int(entry[1]["meets_budget"]),
                entry[1]["score"],
                -entry[1]["min_bid"],
            ),
            reverse=True,
        )

        best_item, best_match = ranked[0]
        explanation, quality = _assistant_build_explanation(intent, best_match, best_item)

        return jsonify(
            {
                "query": query_text,
                "strategy": "gemini-assisted-agent",
                "match_quality": quality,
                "explanation": explanation,
                "recommended_bid": best_match["min_bid"],
                "budget": intent["budget"],
                "min_year": intent["min_year"],
                "categories": intent["categories"],
                "intent_summary": intent.get("summary"),
                "item": best_item,
            }
        ), 200
    except RuntimeError as e:
        return jsonify({"error": str(e)}), 503
    except SQLAlchemyError as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500


@app.route("/api/items/<int:item_id>", methods=["GET"])
@app.route("/api/item/<int:item_id>", methods=["GET"])
def api_get_item(item_id):
    try:
        with engine.connect() as conn:
            item_row = _fetch_item_with_stats(conn, item_id)

            if not item_row:
                return jsonify({"error": "Item not found"}), 404

            item = _serialize_item_row(item_row)
            item["field_values"] = _fetch_item_field_values(conn, item_id)

        return jsonify(item), 200
    except SQLAlchemyError as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500


@app.route("/api/questions", methods=["GET", "POST"])
def api_questions():
    if request.method == "POST":
        payload = request.get_json(silent=True) or {}
        user_id = payload.get("user_id")
        question_text = (payload.get("question_text") or "").strip()
        item_id = payload.get("item_id")

        if user_id is None or not question_text:
            return jsonify({"error": "user_id and question_text are required"}), 400

        try:
            user_id = int(user_id)
            item_id = int(item_id) if item_id is not None else None
        except (TypeError, ValueError):
            return jsonify({"error": "user_id or item_id has invalid type"}), 400

        try:
            with engine.begin() as conn:
                user_row = conn.execute(
                    text(
                        """
                        SELECT id, role, is_active, deleted_at
                        FROM users
                        WHERE id = :user_id
                        LIMIT 1
                        """
                    ),
                    {"user_id": user_id},
                ).fetchone()

                if not user_row or user_row.deleted_at is not None:
                    return jsonify({"error": "User not found"}), 404
                if not user_row.is_active:
                    return jsonify({"error": "User account is inactive"}), 400
                if user_row.role not in {"buyer", "seller"}:
                    return jsonify({"error": "Only buyers and sellers can ask questions"}), 403

                if item_id is not None:
                    item_exists = conn.execute(
                        text("SELECT id FROM items WHERE id = :item_id"),
                        {"item_id": item_id},
                    ).fetchone()
                    if not item_exists:
                        return jsonify({"error": "Item not found"}), 404

                insert_result = conn.execute(
                    text(
                        """
                        INSERT INTO questions (user_id, item_id, question_text)
                        VALUES (:user_id, :item_id, :question_text)
                        """
                    ),
                    {
                        "user_id": user_id,
                        "item_id": item_id,
                        "question_text": question_text,
                    },
                )
                question_id = insert_result.lastrowid

                created_row = conn.execute(
                    text(
                        """
                        SELECT
                            q.id,
                            q.user_id,
                            q.item_id,
                            q.rep_id,
                            q.question_text,
                            q.answer_text,
                            q.asked_at,
                            q.answered_at,
                            asker.username AS user_username,
                            rep.username AS rep_username,
                            i.title AS item_title
                        FROM questions q
                        JOIN users asker ON asker.id = q.user_id
                        LEFT JOIN users rep ON rep.id = q.rep_id
                        LEFT JOIN items i ON i.id = q.item_id
                        WHERE q.id = :question_id
                        """
                    ),
                    {"question_id": question_id},
                ).fetchone()

                return jsonify(_serialize_question_row(created_row)), 201
        except SQLAlchemyError as e:
            return jsonify({"error": f"Database error: {str(e)}"}), 500

    user_id = request.args.get("user_id", type=int)
    item_id = request.args.get("item_id", type=int)
    unanswered_only = request.args.get("unanswered", default="false", type=str).lower() == "true"

    try:
        clauses = ["1=1"]
        params = {}

        if user_id is not None:
            clauses.append("q.user_id = :user_id")
            params["user_id"] = user_id

        if item_id is not None:
            clauses.append("q.item_id = :item_id")
            params["item_id"] = item_id

        if unanswered_only:
            clauses.append("q.answer_text IS NULL")

        with engine.connect() as conn:
            rows = conn.execute(
                text(
                    f"""
                    SELECT
                        q.id,
                        q.user_id,
                        q.item_id,
                        q.rep_id,
                        q.question_text,
                        q.answer_text,
                        q.asked_at,
                        q.answered_at,
                        asker.username AS user_username,
                        rep.username AS rep_username,
                        i.title AS item_title
                    FROM questions q
                    JOIN users asker ON asker.id = q.user_id
                    LEFT JOIN users rep ON rep.id = q.rep_id
                    LEFT JOIN items i ON i.id = q.item_id
                    WHERE {' AND '.join(clauses)}
                    ORDER BY q.asked_at DESC, q.id DESC
                    """
                ),
                params,
            ).fetchall()

        return jsonify([_serialize_question_row(row) for row in rows]), 200
    except SQLAlchemyError as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500


@app.route("/api/questions/<int:question_id>/answer", methods=["POST", "PUT"])
def api_answer_question(question_id):
    payload = request.get_json(silent=True) or {}
    rep_id = payload.get("rep_id")
    answer_text = (payload.get("answer_text") or "").strip()

    if rep_id is None or not answer_text:
        return jsonify({"error": "rep_id and answer_text are required"}), 400

    try:
        rep_id = int(rep_id)
    except (TypeError, ValueError):
        return jsonify({"error": "rep_id has invalid type"}), 400

    try:
        with engine.begin() as conn:
            rep_row = conn.execute(
                text(
                    """
                    SELECT id, role, is_active, deleted_at
                    FROM users
                    WHERE id = :rep_id
                    LIMIT 1
                    """
                ),
                {"rep_id": rep_id},
            ).fetchone()

            if not rep_row or rep_row.deleted_at is not None:
                return jsonify({"error": "Representative not found"}), 404
            if not rep_row.is_active:
                return jsonify({"error": "Representative account is inactive"}), 400
            if rep_row.role not in {"rep", "admin"}:
                return jsonify({"error": "Only reps/admin can answer questions"}), 403

            question_row = conn.execute(
                text(
                    """
                    SELECT q.id, q.user_id, q.item_id, q.answer_text, i.title AS item_title
                    FROM questions q
                    LEFT JOIN items i ON i.id = q.item_id
                    WHERE q.id = :question_id
                    LIMIT 1
                    """
                ),
                {"question_id": question_id},
            ).fetchone()

            if not question_row:
                return jsonify({"error": "Question not found"}), 404

            conn.execute(
                text(
                    """
                    UPDATE questions
                    SET rep_id = :rep_id,
                        answer_text = :answer_text,
                        answered_at = NOW()
                    WHERE id = :question_id
                    """
                ),
                {
                    "rep_id": rep_id,
                    "answer_text": answer_text,
                    "question_id": question_id,
                },
            )

            conn.execute(
                text(
                    """
                    INSERT INTO notifications (user_id, item_id, type, message)
                    VALUES (:user_id, :item_id, 'question_answered', :message)
                    """
                ),
                {
                    "user_id": question_row.user_id,
                    "item_id": question_row.item_id,
                    "message": (
                        f"Rep answered your question on {question_row.item_title}: {answer_text}"
                        if question_row.item_title
                        else f"Rep answered your question: {answer_text}"
                    ),
                },
            )

            updated_row = conn.execute(
                text(
                    """
                    SELECT
                        q.id,
                        q.user_id,
                        q.item_id,
                        q.rep_id,
                        q.question_text,
                        q.answer_text,
                        q.asked_at,
                        q.answered_at,
                        asker.username AS user_username,
                        rep.username AS rep_username,
                        i.title AS item_title
                    FROM questions q
                    JOIN users asker ON asker.id = q.user_id
                    LEFT JOIN users rep ON rep.id = q.rep_id
                    LEFT JOIN items i ON i.id = q.item_id
                    WHERE q.id = :question_id
                    """
                ),
                {"question_id": question_id},
            ).fetchone()

        return jsonify(_serialize_question_row(updated_row)), 200
    except SQLAlchemyError as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500


@app.route("/api/notifications", methods=["GET"])
def api_notifications_list():
    user_id = request.args.get("user_id", type=int)
    if user_id is None:
        return jsonify({"error": "user_id is required"}), 400

    try:
        with engine.connect() as conn:
            user_row = conn.execute(
                text(
                    """
                    SELECT id, is_active, deleted_at
                    FROM users
                    WHERE id = :user_id
                    LIMIT 1
                    """
                ),
                {"user_id": user_id},
            ).fetchone()

            if not user_row or user_row.deleted_at is not None:
                return jsonify({"error": "User not found"}), 404
            if not user_row.is_active:
                return jsonify({"error": "User account is inactive"}), 400

            rows = conn.execute(
                text(
                    """
                    SELECT id, user_id, item_id, type, message, is_read, created_at
                    FROM notifications
                    WHERE user_id = :user_id
                    ORDER BY created_at DESC, id DESC
                    """
                ),
                {"user_id": user_id},
            ).fetchall()

        return jsonify([_serialize_notification_row(row) for row in rows]), 200
    except SQLAlchemyError as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500


@app.route("/api/notifications/<int:notification_id>/read", methods=["POST", "PUT"])
def api_notifications_mark_read(notification_id):
    payload = request.get_json(silent=True) or {}
    user_id = payload.get("user_id")

    if user_id is None:
        return jsonify({"error": "user_id is required"}), 400

    try:
        user_id = int(user_id)
    except (TypeError, ValueError):
        return jsonify({"error": "user_id has invalid type"}), 400

    try:
        with engine.begin() as conn:
            row = conn.execute(
                text(
                    """
                    SELECT id, user_id, item_id, type, message, is_read, created_at
                    FROM notifications
                    WHERE id = :notification_id
                      AND user_id = :user_id
                    LIMIT 1
                    """
                ),
                {"notification_id": notification_id, "user_id": user_id},
            ).fetchone()

            if not row:
                return jsonify({"error": "Notification not found"}), 404

            conn.execute(
                text(
                    """
                    UPDATE notifications
                    SET is_read = TRUE
                    WHERE id = :notification_id
                      AND user_id = :user_id
                    """
                ),
                {"notification_id": notification_id, "user_id": user_id},
            )

            updated = conn.execute(
                text(
                    """
                    SELECT id, user_id, item_id, type, message, is_read, created_at
                    FROM notifications
                    WHERE id = :notification_id
                      AND user_id = :user_id
                    LIMIT 1
                    """
                ),
                {"notification_id": notification_id, "user_id": user_id},
            ).fetchone()

        return jsonify(_serialize_notification_row(updated)), 200
    except SQLAlchemyError as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500


@app.route("/api/items/<int:item_id>/bids", methods=["GET", "POST", "PUT"])
@app.route("/api/item/<int:item_id>/bids", methods=["GET", "POST", "PUT"])
def api_list_item_bids(item_id):
    try:
        with engine.connect() as conn:
            item_row = conn.execute(
                text(
                    """
                    SELECT
                        i.id,
                        i.seller_id,
                        i.starting_price,
                        i.bid_increment,
                        i.closes_at,
                        i.status,
                        MAX(b.amount) AS current_bid
                    FROM items i
                    LEFT JOIN bids b ON b.item_id = i.id AND b.removed_at IS NULL
                    WHERE i.id = :item_id
                    GROUP BY
                        i.id, i.seller_id, i.starting_price, i.bid_increment, i.closes_at, i.status
                    """
                ),
                {"item_id": item_id},
            ).fetchone()

            if not item_row:
                return jsonify({"error": "Item not found"}), 404

            if request.method in {"POST", "PUT"}:
                payload = request.get_json(silent=True) or {}
                bidder_id = payload.get("bidder_id")
                amount = payload.get("amount")
                auto_bid_limit = payload.get("auto_bid_limit")
                is_auto = bool(payload.get("is_auto", auto_bid_limit is not None))

                if bidder_id is None or amount is None:
                    return jsonify({"error": "bidder_id and amount are required"}), 400

                try:
                    bidder_id = int(bidder_id)
                    amount = float(amount)
                except (TypeError, ValueError):
                    return jsonify({"error": "bidder_id or amount has invalid type"}), 400

                if auto_bid_limit is not None:
                    try:
                        auto_bid_limit = float(auto_bid_limit)
                    except (TypeError, ValueError):
                        return jsonify({"error": "auto_bid_limit has invalid type"}), 400

                if item_row.status != "active":
                    return jsonify({"error": "Auction is not active"}), 400

                if item_row.closes_at is None or item_row.closes_at <= conn.execute(text("SELECT NOW() AS now")).scalar_one():
                    return jsonify({"error": "Auction has ended"}), 400

                if bidder_id == item_row.seller_id:
                    return jsonify({"error": "Seller cannot bid on their own item"}), 400

                bidder_row = conn.execute(
                    text("SELECT id, username, is_active FROM users WHERE id = :bidder_id"),
                    {"bidder_id": bidder_id},
                ).fetchone()
                if not bidder_row:
                    return jsonify({"error": "Bidder not found"}), 404
                if not bidder_row.is_active:
                    return jsonify({"error": "Bidder account is inactive"}), 400

                current_bid = _to_float(item_row.current_bid)
                starting_price = _to_float(item_row.starting_price) or 0.0
                bid_increment = _to_float(item_row.bid_increment) or 0.0
                min_bid = (current_bid if current_bid is not None else starting_price) + bid_increment

                if amount < min_bid:
                    return jsonify({"error": f"Bid too low. Minimum allowed is {min_bid:.2f}"}), 400

                if auto_bid_limit is not None and auto_bid_limit < amount:
                    return jsonify({"error": "auto_bid_limit must be greater than or equal to amount"}), 400

                with engine.begin() as tx_conn:
                    insert_result = tx_conn.execute(
                        text(
                            """
                            INSERT INTO bids (item_id, bidder_id, amount, auto_bid_limit, is_auto)
                            VALUES (:item_id, :bidder_id, :amount, :auto_bid_limit, :is_auto)
                            """
                        ),
                        {
                            "item_id": item_id,
                            "bidder_id": bidder_id,
                            "amount": amount,
                            "auto_bid_limit": auto_bid_limit,
                            "is_auto": is_auto,
                        },
                    )
                    new_bid_id = insert_result.lastrowid

                    new_bid_row = tx_conn.execute(
                        text(
                            """
                            SELECT
                                b.id,
                                b.item_id,
                                b.bidder_id,
                                b.amount,
                                b.auto_bid_limit,
                                b.is_auto,
                                b.placed_at,
                                b.removed_by,
                                b.removed_at,
                                u.username AS bidder_username
                            FROM bids b
                            JOIN users u ON u.id = b.bidder_id
                            WHERE b.id = :bid_id
                            """
                        ),
                        {"bid_id": new_bid_id},
                    ).fetchone()

                if not new_bid_row:
                    return jsonify({"error": "Failed to create bid"}), 500

                new_bid = {
                    "id": new_bid_row.id,
                    "item_id": new_bid_row.item_id,
                    "bidder_id": new_bid_row.bidder_id,
                    "amount": _to_float(new_bid_row.amount),
                    "auto_bid_limit": _to_float(new_bid_row.auto_bid_limit),
                    "is_auto": bool(new_bid_row.is_auto),
                    "placed_at": new_bid_row.placed_at.isoformat() if new_bid_row.placed_at else None,
                    "removed_by": new_bid_row.removed_by,
                    "removed_at": new_bid_row.removed_at.isoformat() if new_bid_row.removed_at else None,
                    "bidder_username": new_bid_row.bidder_username,
                }

                return jsonify(new_bid), 201

            bid_rows = conn.execute(
                text(
                    """
                    SELECT
                        b.id,
                        b.item_id,
                        b.bidder_id,
                        b.amount,
                        b.auto_bid_limit,
                        b.is_auto,
                        b.placed_at,
                        b.removed_by,
                        b.removed_at,
                        u.username AS bidder_username
                    FROM bids b
                    JOIN users u ON u.id = b.bidder_id
                    WHERE b.item_id = :item_id
                      AND b.removed_at IS NULL
                    ORDER BY b.amount DESC, b.placed_at DESC
                    """
                ),
                {"item_id": item_id},
            ).fetchall()

            bids = [
                {
                    "id": row.id,
                    "item_id": row.item_id,
                    "bidder_id": row.bidder_id,
                    "amount": _to_float(row.amount),
                    "auto_bid_limit": _to_float(row.auto_bid_limit),
                    "is_auto": bool(row.is_auto),
                    "placed_at": row.placed_at.isoformat() if row.placed_at else None,
                    "removed_by": row.removed_by,
                    "removed_at": row.removed_at.isoformat() if row.removed_at else None,
                    "bidder_username": row.bidder_username,
                }
                for row in bid_rows
            ]

        return jsonify(bids), 200
    except SQLAlchemyError as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500


if __name__ == "__main__":
    app.run(debug=True, use_reloader=False)
