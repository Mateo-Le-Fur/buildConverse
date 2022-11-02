BEGIN;

    DROP TABLE
        "user",
        "namespace",
        "room",
        "message",
        "friend",
        "friend_request",
        "ban",
        "admin",
        "user_has_namespace";

DROP TYPE data_type;


CREATE TYPE data_type AS ENUM ('text', 'image', 'file');

CREATE TABLE "user" (
    "id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "pseudo" TEXT NOT NULL,
    "email" TEXT NOT NULL UNIQUE,
    "password" TEXT,
    "status" TEXT,
    "avatar_url" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ
);

CREATE TABLE "namespace" (
    "id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "name" TEXT NOT NULL,
    "invite_code" TEXT NOT NULL,
    "img_url" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ
);

CREATE TABLE "room" (
    "id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "name" TEXT NOT NULL,
    "index" INT,
    "namespace_id" INT NOT NULL REFERENCES "namespace"("id") ON DELETE CASCADE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ
);

CREATE TABLE "message" (
    "id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "data" TEXT NOT NULL,
    "data_type" data_type NOT NULL DEFAULT 'text',
    "author_name" TEXT NOT NULL,
    "user_id" INT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE ,
    "room_id" INT NOT NULL REFERENCES "room"(id) ON DELETE CASCADE ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ
);

CREATE TABLE "friend" (
    "id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "user_id" INT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    "friend_id" INT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "friend_request" (
    "id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "applicant_id" INT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    "recipient_id" INT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE TABLE "ban" (
    "id" int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "user_id" int NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    "namespace_id" int NOT NULL REFERENCES "namespace"(id) ON DELETE CASCADE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "admin" (
    "id" int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "user_id" int NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    "namespace_id" int NOT NULL REFERENCES "namespace"(id) ON DELETE CASCADE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE TABLE "user_has_namespace" (
    "id" int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "user_id" int NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    "namespace_id" int NOT NULL REFERENCES "namespace"(id) ON DELETE CASCADE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMIT;


