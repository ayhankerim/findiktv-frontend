import { fetchAPI } from "./fetch-api";

interface SignInParams {
  email: string;
  password: string;
}
interface UserDataParam {
  jwt: string;
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

export async function userData({ jwt }: UserDataParam): Promise<any> {
  try {
    const res = await fetchAPI(
      `/users/me?populate=avatar,city,SystemAvatar,profile_cover,role`,
      {},
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      }
    );
    return res;
  } catch (err: any) {
    console.error({ api: err.message });
    throw err;
  }
}