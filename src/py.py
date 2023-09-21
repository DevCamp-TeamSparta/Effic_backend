import psycopg2

# 데이터베이스 연결 정보 설정
conn = psycopg2.connect(
    database="effic",
    user="effic",
    password="ship99",
    host="localhost",
    port="5432"
)

# 커서 생성
cur = conn.cursor()

# 삽입할 데이터 정의
data_to_insert = [
    (15228016, '', 1),
    (01031410509, '', 1),
    (025527759, '', 1),
    (025527752, '', 1),
    (025527751, '', 1),
    (025543599, '', 1),
    (025686479, '', 1),
    (07043662776, '', 1),
    (025527753, '', 1),
    (025527758, '', 1),
    (01062509911, '', 1),
]

# userId를 2부터 127까지 변경하면서 데이터 삽입
for user_id in range(2, 128):
    for data in data_to_insert:
        data_with_user_id = (data[0], data[1], user_id)
        cur.execute("INSERT INTO hostnumber_detail (hostnumber, memo, userId) VALUES (%s, %s, %s)", data_with_user_id)

# 변경사항을 커밋
conn.commit()

# 연결 종료
conn.close()
