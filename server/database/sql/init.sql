BEGIN;

DROP TABLE
    "user",
    "namespace",
    "room",
    "message",
    "ban",
    "friend",
    "friend_request",
    "private_room",
    "private_message",
    "user_has_private_room",
    "user_has_namespace";

DROP TYPE data_type;
DROP SEQUENCE room_index;

CREATE TYPE data_type AS ENUM ('text', 'image', 'file', 'invitation');
CREATE SEQUENCE room_index START WITH 1 INCREMENT BY 1;
GRANT USAGE, SELECT ON SEQUENCE room_index TO chat;


CREATE TABLE "user" (
    "id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "pseudo" TEXT NOT NULL,
    "email" TEXT NOT NULL UNIQUE,
    "password" TEXT,
    "status" TEXT NOT NULL DEFAULT 'offline',
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
    "index" INT NOT NULL DEFAULT nextval('room_index'),
    "namespace_id" INT NOT NULL REFERENCES "namespace"("id") ON DELETE CASCADE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ
);

CREATE TABLE "message" (
    "id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "user_id" INT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    "room_id" INT NOT NULL REFERENCES "room"(id) ON DELETE CASCADE,
    "data" TEXT NOT NULL,
    "data_type" data_type NOT NULL DEFAULT 'text',
    "author_name" TEXT NOT NULL,
    "avatar_author" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ
);


CREATE TABLE "ban" (
    "id" INT GENERATED ALWAYS AS  IDENTITY PRIMARY KEY,
    "user_id" INT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    "namespace_id" INT NOT NULL REFERENCES "namespace"(id) ON DELETE CASCADE,
    "reason" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "friend" (
    "id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "user1_id" INT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    "user2_id" INT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user1_id, user2_id)
);

CREATE TABLE "friend_request" (
    "id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "sender_id" INT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    "recipient_id" INT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (sender_id, recipient_id)
);

CREATE TABLE private_room (
    "id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ
);

CREATE TABLE private_message (
    "id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "data" TEXT NOT NULL,
    "data_type" data_type NOT NULL DEFAULT 'text',
    "private_room_id" INT NOT NULL REFERENCES "private_room"(id) ON DELETE CASCADE,
    "user_id" INT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    "author_name" TEXT NOT NULL,
    "avatar_author" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ
);

CREATE TABLE "user_has_private_room" (
    "id" int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "user_id" int NOT NULL REFERENCES "user" (id) ON DELETE CASCADE,
    "private_room_id" int NOT NULL REFERENCES "private_room" (id) ON DELETE CASCADE,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, private_room_id)
);

CREATE TABLE "user_has_namespace" (
    "id" int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "user_id" int NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    "namespace_id" int NOT NULL REFERENCES "namespace"(id) ON DELETE CASCADE,
    "admin" boolean NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMIT;


