import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist } from "zustand/middleware";
import { AppwriteException, ID, Models } from "appwrite";
import { account } from "../models/client/config";

export interface UserPrefs {
  reputation: number;
}

interface IAuthStore {
  user: Models.User<UserPrefs> | null;
  session: Models.Session | null;
  jwt: string | null;
  hydrated: boolean;

  setHydrated(): void;
  setSession(session: Models.Session | null): void;
  verifySession(): Promise<void>;
  login: (
    email: string,
    password: string,
  ) => Promise<{
    success: boolean;
    error: AppwriteException | null;
  }>;
  createAccount: (
    email: string,
    password: string,
    name: string,
  ) => Promise<{
    success: boolean;
    error: AppwriteException | null;
  }>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<IAuthStore>()(
  persist(
    immer((set) => ({
      user: null,
      session: null,
      jwt: null,
      hydrated: false,

      setHydrated() {
        set({ hydrated: true });
      },

      setSession(session: Models.Session | null) {
        set({ session });
      },

      async verifySession() {
        try {
          const session = await account.getSession("current");
          set({ session });
        } catch {
          set({ session: null });
        }
      },

      async login(email, password) {
        try {
          const session = await account.createEmailPasswordSession(
            email,
            password,
          );
          const [user, jwt] = await Promise.all([
            account.get<UserPrefs>(),
            account.createJWT(),
          ]);

          if (!user.prefs?.reputation) {
            await account.updatePrefs({ reputation: 0 });
            user.prefs = { reputation: 0 };
          }
          set({ session, user, jwt: jwt.jwt });
          return { success: true, error: null };
        } catch (error) {
          return {
            success: false,
            error: error as AppwriteException,
          };
        }
      },

      async createAccount(email, password, name) {
        try {
          await account.create(ID.unique(), email, password, name);
          return { success: true, error: null };
        } catch (error) {
          return {
            success: false,
            error: error as AppwriteException,
          };
        }
      },

      async logout() {
        try {
          await account.deleteSessions();
          set({ user: null, session: null, jwt: null });
        } catch (error) {
          console.error("Logout failed:", error);
        }
      },
    })),
    {
      name: "auth",
      onRehydrateStorage() {
        return (state, error) => {
          if (!error) state?.setHydrated();
        };
      },
    },
  ),
);
