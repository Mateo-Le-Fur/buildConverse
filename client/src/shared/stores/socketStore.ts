import { defineStore } from "pinia";
import { io, type ManagerOptions, Socket } from "socket.io-client";
import type { Namespace } from "@/shared/interfaces/Namespace";
import type { RoomInterface } from "@/shared/interfaces/Room";
import type { Message } from "@/shared/interfaces/Message";
import type { User } from "@/shared/interfaces/User";
import { useRoom } from "@/features/server/stores/roomStore";
import { useNsUser } from "@/features/server/stores/userNsStore";
import { useUser } from "@/shared/stores/authStore";
import type { FriendsInterface } from "@/shared/interfaces/FriendsInterface";
import { useMe } from "@/features/home/stores/meStore";
import type { RecipientInterface } from "@/shared/interfaces/RecipientInterface";

interface SocketState {
  ioClient: Socket | null;
  opts: Partial<ManagerOptions>;
  activeNsSocket: any;
  namespaces: Namespace[];
  namespaceSockets: [] | any;
  messages: Message[];
  isNamespacesLoaded: boolean;
  creatingNamespace: boolean | null;
  isNamespaceUpdated: boolean;
  countLoadedNamespace: number;
  error: any;
}

export const useSocket = defineStore("socket", {
  state: (): SocketState => ({
    ioClient: null,
    activeNsSocket: null,
    namespaceSockets: [],
    namespaces: [],
    messages: [],
    isNamespacesLoaded: false,
    creatingNamespace: false,
    isNamespaceUpdated: false,
    countLoadedNamespace: 0,
    error: null,
    opts: { reconnection: false, forceNew: false, transports: ["websocket"] },
  }),

  getters: {
    currentNamespace(state): (namespaceId: string) => Namespace | undefined {
      return (namespaceId: string) =>
        state.namespaces.find((ns: Namespace) => ns.id === Number(namespaceId));
    },
  },

  actions: {
    init() {
      this.ioClient = io(this.opts);

      let checkInterval: number;
      this.ioClient.on("connect", () => {
        checkInterval = setInterval(() => {
          this.ioClient?.emit("jwt_expire", () => "check");
        }, 1000 * 60);
      });

      this.ioClient?.on("connect_error", (err) => {
        console.log(err.message);
      });

      this.ioClient?.on("jwt_expire", async (data: boolean) => {
        if (data) {
          clearInterval(checkInterval);
          const userStore = useUser();
          await userStore.logout();
        }
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

      this.ioClient?.on("getPrivateMessagesHistory", (data: Message[]) => {
        meStore.getPrivateMessageHistory(data);
      });

      this.ioClient?.on("privateMessage", (data: Message) => {
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

      this.ioClient?.on("deleteFriend", async (friendId) => {
        if (friendId) {
          meStore.deleteFriend(friendId);
        }
      });

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
      this.ioClient?.on("namespaces", (data: Namespace[]) => {
        if (!data.length) this.isNamespacesLoaded = true;

        this.namespaces.push(...data);

        for (const ns of this.namespaces) {
          const nsSocket = io(`/${ns.id}`);

          this.initNamespaceData(nsSocket, data.length, () => {
            this.isNamespacesLoaded = true;
          });

          this.namespaceSockets.push(nsSocket);
        }
      });

      this.ioClient?.on("createdNamespace", async (data: Namespace[]) => {
        const roomStore = useRoom();

        const ns = data[0];

        const nsSocket = io(`/${ns.id}`);

        this.initNamespaceData(nsSocket, data.length, async () => {
          this.namespaces.push(...data);

          this.namespaceSockets.push(nsSocket);

          if (this.activeNsSocket) {
            this.activeNsSocket.emit("leaveRoom", roomStore.activeRoom?.id);
          }

          this.creatingNamespace = false;

          // @ts-ignore
          await this.router.push(`/channels/${ns.id}/${ns.rooms[0].id}`);
        });
      });
    },

    initNamespaceData(
      nsSocket: any,
      numberOfnamespace: number,
      callback: () => void
    ) {
      const roomStore = useRoom();
      const userNsStore = useNsUser();

      nsSocket.on("rooms", (data: RoomInterface[]) => {
        roomStore.getRoomsData(data);

        this.countLoadedNamespace++;

        if (this.countLoadedNamespace === numberOfnamespace) {
          callback();
          this.countLoadedNamespace = 0;
        }
      });

      nsSocket.on(
        "userList",
        (data: { users: User[]; numberOfUsers: number }) => {
          userNsStore.getUsersData(data);
        }
      );

      nsSocket.on("loadMoreUser", (data: User[]) => {
        userNsStore.loadMoreUser(data);
      });

      nsSocket.on("updateUser", async (data: User) => {
        await userNsStore.updateUser(data);
      });

      nsSocket.on("deleteUser", async (data: { id: number }) => {
        userNsStore.deleteUser(data);
      });

      nsSocket.on("userConnect", async (data: { id: number }) => {
        const userNsStore = useNsUser();
        userNsStore.userConnect(data);
      });

      nsSocket.on("userDisconnect", async (data: { id: number }) => {
        const userNsStore = useNsUser();

        userNsStore.userDisconnect(data);
      });

      nsSocket.on("userJoinNamespace", (data: User[]) => {
        userNsStore.addNewUser(data);
      });

      nsSocket.on("userLeaveNamespace", async (data: { id: number }) => {
        await this.userLeaveNamespace(data);
      });

      nsSocket.on("history", (data: Message[]) => {
        this.messages = data;
      });

      nsSocket.on("message", (data: Message) => {
        this.messages.push(data);
      });

      nsSocket.on("createRoom", async (data: RoomInterface) => {
        roomStore.createRoom(data);
      });

      nsSocket.on("updateRoom", async (data: RoomInterface) => {
        roomStore.updateRoom(data);
      });

      nsSocket.on("deleteRoom", async (data: RoomInterface) => {
        await roomStore.deleteRoom(data);
      });

      nsSocket.on("updateNamespace", async (data: Namespace) => {
        await this.updateNamespace(data);
      });

      nsSocket.on("deleteNamespace", async (data: { id: number }) => {
        await this.deleteNamespace(data);
      });

      nsSocket.on("connect_error", (err: Error) => {
        console.error(err);
      });
    },

    joinNamespace(nsSocket: any, roomId: string, namespaceId: string) {
      const roomStore = useRoom();
      const userNsStore = useNsUser();

      this.activeNsSocket = nsSocket;

      const room = roomStore.findRoom(roomId);

      roomStore.joinRoom(room, Number(namespaceId));

      userNsStore.isUsersLoaded = false;

      this.activeNsSocket.emit("getNamespaceUsers", namespaceId);
    },

    async userLeaveNamespace(data: { id: number }) {
      const userNsStore = useNsUser();
      userNsStore.userList = userNsStore.userList.filter(
        (user) => user.id !== data.id
      );

      userNsStore.numberOfUsers--;
    },

    async deleteNamespace(data: { id: number }) {
      const roomStore = useRoom();
      const userNsStore = useNsUser();

      roomStore.activeRoom = null;

      roomStore.rooms = roomStore.rooms.filter(
        (room) => room.namespaceId !== data.id
      );

      userNsStore.userList = userNsStore.userList.filter(
        (user) => user.UserHasNamespace.namespaceId !== data.id
      );

      const namespaceIndex = this.namespaces.findIndex(
        (ns) => ns.id === data.id
      );

      const namespaceSocketIndex = this.namespaceSockets.findIndex(
        (ns: any) => ns.nsp === `/${data.id}`
      );

      const namespaceSocket = this.namespaceSockets.find(
        (nsSocket: any) => nsSocket.nsp === `/${data.id}`
      );

      namespaceSocket.disconnect();

      if (namespaceIndex !== -1) {
        this.namespaces.splice(namespaceIndex, 1);
      }

      if (namespaceSocketIndex !== -1) {
        this.namespaceSockets.splice(namespaceSocketIndex, 1);
      }

      this.activeNsSocket = null;
      // @ts-ignore
      await this.router.push("/channels/me");
    },

    async updateNamespace(data: Namespace) {
      this.isNamespaceUpdated = true;

      const { UserHasNamespace } = this.namespaces.find(
        (ns) => ns.id === data.id
      )!;

      const namespaceIndex = this.namespaces.findIndex(
        (ns) => ns.id === data.id
      );

      this.namespaces[namespaceIndex] = data;

      this.namespaces[namespaceIndex].UserHasNamespace = UserHasNamespace;
    },

    getFilteredMessages() {
      return this.messages.map((message, index) => {
        const previous = this.messages[index - 1];
        const showAvatar = this.shouldShowAvatar(previous, message);

        if (showAvatar) {
          return message;
        } else {
          return {
            ...message,
            avatarAuthor: null,
          };
        }
      });
    },

    shouldShowAvatar(previous: Message, message: Message) {
      const isFirst = !previous;
      if (isFirst) return true;

      const differentUser = message.authorName !== previous.authorName;
      if (differentUser) return true;
    },

    setError(message: string) {
      this.error = message;
      setTimeout(() => {
        this.error = null;
      }, 2000);
    },
  },
});
