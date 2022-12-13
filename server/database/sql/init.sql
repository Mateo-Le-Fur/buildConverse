BEGIN;

DROP TABLE
    "user",
    "namespace",
    "room",
    "message",
    "private_chats",
    "private_messages",
    "bans",
    "friend",
    "friend_request",
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
    "user_id" INT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE ,
    "room_id" INT NOT NULL REFERENCES "room"(id) ON DELETE CASCADE ,
    "data" TEXT NOT NULL,
    "data_type" data_type NOT NULL DEFAULT 'text',
    "author_name" TEXT NOT NULL,
    "avatar_author" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ
);

CREATE TABLE private_chats (
    "id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "user1_id" INT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    "user2_id" INT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE private_messages (
    "id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "data" TEXT NOT NULL,
    "data_type" data_type NOT NULL DEFAULT 'text',
    "chat_id" INT NOT NULL REFERENCES "private_chats"(id) ON DELETE CASCADE,
    "user_id" INT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ
);

CREATE TABLE "bans" (
    "id" INT GENERATED ALWAYS AS  IDENTITY PRIMARY KEY,
    "user_id" INT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    "namespace_id" INT NOT NULL REFERENCES "namespace"(id) ON DELETE CASCADE,
    "reason" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "friends" (
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
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    UNIQUE (sender_id, recipient_id)
);


CREATE TABLE "user_has_namespace" (
    "id" int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "user_id" int NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    "namespace_id" int NOT NULL REFERENCES "namespace"(id) ON DELETE CASCADE,
    "admin" boolean NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMIT;


