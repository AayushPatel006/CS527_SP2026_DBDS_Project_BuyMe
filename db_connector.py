# from flask import Flask, jsonify
from flask_cors import CORS
from flask import Flask, jsonify, request
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError

app = Flask(__name__)
CORS(app)
# Update these with your MySQL credentials
DB_USER = "root"
DB_PASSWORD = "happyDAY1134"
DB_HOST = "localhost"
DB_PORT = "3306"
DB_NAME = "buyme"


DATABASE_URL = (
    f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
)

engine = create_engine(DATABASE_URL, pool_pre_ping=True)


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
    query = text("""
        INSERT IGNORE INTO users (username, email, password_hash, role) VALUES
        ('admin', 'admin@buyme.com', 'hash', 'admin'),
        ('john_seller', 'john@example.com', 'hash', 'seller'),
        ('jane_buyer', 'jane@example.com', 'hash', 'buyer'),
        ('rep_mike', 'mike@buyme.com', 'hash', 'rep'),
        ('alice_buyer', 'alice@example.com', 'hash', 'buyer'),
        ('bob_seller', 'bob@example.com', 'hash', 'seller'),
        ('charlie_buyer', 'charlie@example.com', 'hash', 'buyer'),
        ('david_buyer', 'david@example.com', 'hash', 'buyer'),
        ('emma_seller', 'emma@example.com', 'hash', 'seller'),
        ('olivia_buyer', 'olivia@example.com', 'hash', 'buyer')
    """)

    with engine.begin() as conn:
        conn.execute(query)

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
        (10, 'Sport Bikes', 4, 'leaf')
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

def get_default_image(category_name):
    mapping = {
        "Sedans": "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600",
        "SUVs": "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600",
        "Sports Cars": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600",
        "Pickup Trucks": "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=600",
        "Cruisers": "https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=600",
        "Sport Bikes": "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600",
    }
    return mapping.get(category_name)

@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "BuyMe seed API is running"}), 200

@app.route("/categories", methods=["GET"])
def get_categories():
    try:
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT id, name, parent_id, level
                FROM category
                ORDER BY id
            """))
            rows = result.fetchall()

            categories = [
                {
                    "id": row.id,
                    "name": row.name,
                    "parent_id": row.parent_id,
                    "level": row.level
                }
                for row in rows
            ]

        return jsonify(categories), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/seed/users", methods=["POST"])
def api_seed_users():
    try:
        return jsonify(seed_users()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/seed/categories", methods=["POST"])
def api_seed_categories():
    try:
        return jsonify(insert_categories()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/seed/category-fields", methods=["POST"])
def api_seed_category_fields():
    try:
        return jsonify(insert_category_fields()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/seed/items", methods=["POST"])
def api_seed_items():
    try:
        return jsonify(insert_items()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/seed/bids", methods=["POST"])
def api_seed_bids():
    try:
        return jsonify(insert_bids()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/seed/questions", methods=["POST"])
def api_seed_questions():
    try:
        return jsonify(insert_and_update_questions()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/seed/notifications", methods=["POST"])
def api_seed_notifications():
    try:
        return jsonify(insert_notifications()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/seed/all", methods=["POST"])
def api_seed_all():
    try:
        results = []
        results.append(seed_users())
        results.append(insert_categories())
        results.append(insert_category_fields())
        results.append(insert_items())
        results.append(insert_bids())
        results.append(insert_and_update_questions())
        results.append(insert_notifications())

        return jsonify({
            "message": "Database seeding complete",
            "steps": results
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
@app.route("/items", methods=["GET"])
def get_items():
    try:
        search = request.args.get("search")
        category_id = request.args.get("category_id")
        status = request.args.get("status")

        query = """
            SELECT
                i.id,
                i.seller_id,
                i.category_id,
                i.title,
                i.description,
                i.starting_price,
                i.reserve_price,
                i.bid_increment,
                i.closes_at,
                i.created_at,
                CASE
                    WHEN i.closes_at < NOW() THEN 'closed'
                    ELSE 'active'
                END AS status,
                u.username AS seller_username,
                c.name AS category_name,
                COALESCE(MAX(b.amount), i.starting_price) AS current_bid,
                COUNT(b.id) AS bid_count
            FROM items i
            JOIN users u ON i.seller_id = u.id
            JOIN category c ON i.category_id = c.id
            LEFT JOIN bids b ON i.id = b.item_id
            WHERE 1=1
        """

        params = {}

        if category_id:
            category_id = int(category_id)

            if category_id == 2:  # Cars
                query += " AND i.category_id IN (5, 6, 7)"
            elif category_id == 3:  # Trucks
                query += " AND i.category_id IN (8)"
            elif category_id == 4:  # Motorcycles
                query += " AND i.category_id IN (9, 10)"
            else:
                query += " AND i.category_id = :category_id"
                params["category_id"] = category_id

        if status:
            if status == "active":
                query += " AND i.closes_at >= NOW()"
            elif status == "closed":
                query += " AND i.closes_at < NOW()"

        if search:
            query += " AND (LOWER(i.title) LIKE :search OR LOWER(i.description) LIKE :search)"
            params["search"] = f"%{search.lower()}%"

        query += """
            GROUP BY
                i.id, i.seller_id, i.category_id, i.title, i.description,
                i.starting_price, i.reserve_price, i.bid_increment,
                i.closes_at, i.created_at,
                u.username, c.name
            ORDER BY i.created_at DESC
        """

        with engine.connect() as conn:
            result = conn.execute(text(query), params)
            rows = result.fetchall()

            items = [
                {
                    "id": row.id,
                    "seller_id": row.seller_id,
                    "category_id": row.category_id,
                    "title": row.title,
                    "description": row.description,
                    "starting_price": float(row.starting_price),
                    "reserve_price": float(row.reserve_price) if row.reserve_price is not None else None,
                    "bid_increment": float(row.bid_increment),
                    "closes_at": row.closes_at.isoformat(),
                    "created_at": row.created_at.isoformat(),
                    "status": row.status,
                    "seller_username": row.seller_username,
                    "category_name": row.category_name,
                    "current_bid": float(row.current_bid),
                    "bid_count": int(row.bid_count),
                    "image_url": get_default_image(row.category_name)
                }
                for row in rows
            ]

        return jsonify(items), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/stats", methods=["GET"])
def get_stats():
    try:
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT
                    (SELECT COUNT(*) FROM items WHERE closes_at >= NOW()) AS active_auctions,
                    (SELECT COUNT(*) FROM users WHERE role = 'seller') AS verified_sellers,
                    (SELECT COUNT(*) FROM items) AS vehicles_listed
            """))
            row = result.fetchone()

            stats = {
                "active_auctions": int(row.active_auctions),
                "verified_sellers": int(row.verified_sellers),
                "vehicles_listed": int(row.vehicles_listed),
            }

        return jsonify(stats), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
if __name__ == "__main__":
    app.run(debug=True, use_reloader=False)