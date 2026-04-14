from flask import Flask, jsonify
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError

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



@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "BuyMe seed API is running"}), 200


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


if __name__ == "__main__":
    app.run(debug=True, use_reloader=False)