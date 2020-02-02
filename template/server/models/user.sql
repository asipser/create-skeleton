{{^nosql}}
CREATE TABLE "users" (
  "id" bigserial PRIMARY KEY,
  "firstname" varchar(255),
  "lastname" varchar(255),
  "googleid" varchar(100) UNIQUE,
  "email" varchar(100) UNIQUE,
  "password" varchar(100)
);

{{/nosql}}