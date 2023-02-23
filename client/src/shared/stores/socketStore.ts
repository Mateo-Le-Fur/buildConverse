import { defineStore } from "pinia";
import { io, type ManagerOptions, Socket } from "socket.io-client";
import type { Namespace } from "@/shared/interfaces/Namespace";
import type { RoomInterface } from "@/shared/interfaces/Room";
import type { MessageInterface } from "@/shared/interfaces/MessageInterface";
import type { User } from "@/shared/interfaces/User";
import type { RecipientInterface } from "@/shared/interfaces/RecipientInterface";
import type { PrivateMessageInterface } from "@/shared/interfaces/PrivateMessageInterface";
import type { FriendsInterface } from "@/shared/interfaces/FriendsInterface";
import { useRoom } from "@/features/server/stores/roomStore";
import { useNsUser } from "@/features/server/stores/userNsStore";
import { useUser } from "@/shared/stores/authStore";
import { useMe } from "@/features/home/stores/meStore";
import { useNamespace } from "@/features/server/stores/namespaceStore";
import { useMessage } from "@/features/server/stores/messageStore";

interface SocketState {
  ioClient: Socket | null;
  opts: Partial<ManagerOptions>;
  numberOfLoadedNamespaces: number;
  error: any;
}

export const useSocket = defineStore("socket", {
  state: (): SocketState => ({
    ioClient: null,
    numberOfLoadedNamespaces: 0,
    error: null,
    opts: {
      reconnection: false,
      forceNew: false,
      transports: ["websocket"],
      withCredentials: true,
    },
  }),

  actions: {
    init() {
      this.ioClient = io(this.opts);

      this.ioClient?.on("connect_error", (err) => {
        console.log(err.message);
      });
    },

    initMe() {
      const meStore = useMe();

      this.ioClient?.on("friends", (data: FriendsInterface[]) => {
        meStore.getFriends(data);
      });

      this.ioClient?.on("conversations", (data: RecipientInterface[]) => {
        meStore.getAllConversations(data);
      });

      this.ioClient?.on(
        "getPrivateMessagesHistory",
        (data: PrivateMessageInterface[]) => {
          meStore.getPrivateMessageHistory(data);
        }
      );

      this.ioClient?.on(
        "loadMorePrivateMessages",
        (data: PrivateMessageInterface[]) => {
          meStore.loadMorePrivateMessages(data);
        }
      );

      this.ioClient?.on("privateMessage", (data: PrivateMessageInterface) => {
        meStore.privateMessage(data);
      });

      this.ioClient?.on(
        "getConversationWithAFriend",
        (data: RecipientInterface) => {
          meStore.getConversationWithAFriend(data);
        }
      );

      this.ioClient?.on("friendRequest", (data: FriendsInterface) => {
        meStore.friendRequest(data);
      });

      this.ioClient?.on("acceptFriendRequest", (data: FriendsInterface) => {
        meStore.acceptFriendRequest(data);
      });

      this.ioClient?.on("declineFriendRequest", (senderId: number) => {
        meStore.declineFriendRequest(senderId);
      });

      this.ioClient?.on("friendRequestAccepted", (data: FriendsInterface) => {
        meStore.friendRequestAccepted(data);
      });

      this.ioClient?.on(
        "deleteFriend",
        async (data: { id: number; privateRoomId: number }) => {
          if (data) {
            meStore.deleteFriend(data);
          }
        }
      );

      this.ioClient?.on("updateUser", async (data: FriendsInterface | null) => {
        if (data) {
          meStore.updateUser(data);
        }
      });

      this.ioClient?.on("deleteUser", async (data: { id: number } | null) => {
        if (data) {
        }
      });

      this.ioClient?.on("userConnect", async (data: { id: number }) => {
        meStore.userConnect(data);
      });

      this.ioClient?.on("userDisconnect", async (data: { id: number }) => {
        meStore.userDisconnect(data);
      });
    },

    initNamespaces() {
      const messageStore = useMessage();
      const namespaceStore = useNamespace();
      const roomStore = useRoom();
      const userNsStore = useNsUser();

      this.ioClient?.on("namespaces", (data: Namespace[]) => {
        namespaceStore.init(data);
      });

      this.ioClient?.on(
        "userList",
        (data: { users: User[]; numberOfUsers: number }) => {
          userNsStore.getUsersData(data);
        }
      );

      this.ioClient?.on("loadMoreUser", (data: User[]) => {
        userNsStore.loadMoreUser(data);
      });

      this.ioClient?.on("updateUser", async (data: User) => {
        await userNsStore.updateUser(data);
      });

      this.ioClient?.on(
        "deleteUser",
        async (data: { id: number; nsId: number }) => {
          userNsStore.deleteUser(data);
        }
      );

      this.ioClient?.on("userConnectedToTheServer", async (data: User[]) => {
        userNsStore.userConnect(data);
      });

      this.ioClient?.on("userDisconnect", async (data: { id: number }) => {
        userNsStore.userDisconnect(data);
      });

      this.ioClient?.on("userJoinNamespace", (data: User[]) => {
        userNsStore.addNewUser(data);
      });

      this.ioClient?.on("userLeaveNamespace", async (data: { id: number }) => {
        namespaceStore.userLeaveNamespace(data);
      });

      this.ioClient?.on("history", async (data: MessageInterface[]) => {
        messageStore.getHistory(data);
      });

      this.ioClient?.on("message", (data: MessageInterface) => {
        messageStore.getMessage(data);
      });

      this.ioClient?.on("loadMoreMessages", (data: MessageInterface[]) => {
        messageStore.loadMoreMessages(data);
      });

      this.ioClient?.on("createRoom", async (data: RoomInterface) => {
        roomStore.createRoom(data);
      });

      this.ioClient?.on("updateRoom", async (data: RoomInterface) => {
        roomStore.updateRoom(data);
      });

      this.ioClient?.on("deleteRoom", async (data: RoomInterface) => {
        await roomStore.deleteRoom(data);
      });

      this.ioClient?.on("updateNamespace", async (data: Namespace) => {
        await namespaceStore.updateNamespace(data);
      });

      this.ioClient?.on("deleteNamespace", async (data: { id: number }) => {
        await namespaceStore.deleteNamespace(data);
      });

      this.ioClient?.on("connect_error", (err: Error) => {
        console.error(err);
      });

      this.ioClient?.on("createdNamespace", async (data: Namespace) => {
        namespaceStore.createNamespace(data);

        this.ioClient?.emit("leaveRoom", roomStore.activeRoom?.id);

        // @ts-ignore
        await this.router.push(`/channels/${data.id}/${data.rooms[0].id}`);
      });
    },

    setError(message: string) {
      this.error = message;
    },
  },
});
