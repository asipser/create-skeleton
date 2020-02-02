{{^nosql}}
CREATE TABLE "users" (
  "id" bigserial PRIMARY KEY,
{{#auth.google}}
  "firstname" varchar(255),
  "lastname" varchar(255),
  "googleid" varchar(100) UNIQUE,
{{/auth.google}}
{{#auth.local}}
  "email" varchar(100) UNIQUE,
  "password" varchar(100)
{{/auth.local}}
);

{{/nosql}}