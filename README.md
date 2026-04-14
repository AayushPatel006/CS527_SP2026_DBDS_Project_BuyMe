##To connect DB:

Update  the variables below with your MySQL credentials:
DB_USER = "user"
DB_PASSWORD = "pwd"
DB_HOST = "localhost"
DB_PORT = "3306"
DB_NAME = "buyme"

Run db_connector.py

To ensure it is working, go the link  below:
http://127.0.0.1:5000

You should see:
{"message": "BuyMe seed API is running"}

To verify from DB:

select * from users;
select * from items;


 