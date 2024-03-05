import { fetchAPI } from "./fetch-api";

interface SignInParams {
  email: string;
  password: string;
}

export async function signIn({ email, password }: SignInParams): Promise<any> {
  try {
    const res = await fetchAPI(
      `/auth/local`,
      {},
      {
        method: "POST",
        body: JSON.stringify({
          identifier: email,
          password,
        }),
      }
    );
    return res;
  } catch (err: any) {
    console.error({ api: err.message });
    throw err;
  }
}
