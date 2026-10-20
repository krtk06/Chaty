const loadScript = (src, existingCheck, promiseRef) => {
  if (existingCheck()) return Promise.resolve(true);
  if (promiseRef.current) return promiseRef.current;
  promiseRef.current = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve(true);
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });
  return promiseRef.current;
};

const googleRef = { current: null };
const appleRef = { current: null };

export const loadGoogleScript = () =>
  loadScript(
    'https://accounts.google.com/gsi/client',
    () => !!window.google?.accounts?.id,
    googleRef
  );

export const loadAppleScript = () =>
  loadScript(
    'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js',
    () => !!window.AppleID?.auth,
    appleRef
  );

const postSocialToken = async (axios, endpoint, body) => {
  const { data } = await axios.post(endpoint, body);
  if (!data?.success) throw new Error(data?.message || 'Social sign-in failed');
  return data.token;
};

// OAuth account-chooser popup, used when One Tap is skipped or dismissed.
const requestCredentialViaPopup = (clientId) =>
  new Promise((resolve, reject) => {
    try {
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'openid email profile',
        callback: (tokenResp) => {
          if (tokenResp?.access_token) {
            resolve({ __accessToken: tokenResp.access_token });
          } else {
            reject(new Error('Google account chooser was closed'));
          }
        },
      });
      tokenClient.requestAccessToken();
    } catch {
      reject(new Error('Google account chooser was closed'));
    }
  });

// Ask Google One Tap for an ID token; falls back to the popup when skipped.
const requestGoogleCredential = (clientId) =>
  new Promise((resolve, reject) => {
    let settled = false;
    const settle = (fn, value) => {
      if (!settled) {
        settled = true;
        fn(value);
      }
    };

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (resp) => {
        if (resp?.credential) settle(resolve, resp.credential);
        else settle(reject, new Error('Google did not return a credential'));
      },
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    window.google.accounts.id.prompt((notification) => {
      const skipped =
        notification?.isSkippedMoment?.() ||
        notification?.isDismissedMoment?.() ||
        notification?.getMomentType?.() === 'skipped';
      if (skipped) {
        requestCredentialViaPopup(clientId)
          .then((credential) => settle(resolve, credential))
          .catch((error) => settle(reject, error));
      }
    });

    setTimeout(() => {
      settle(reject, new Error('Google sign-in timed out — please try again'));
    }, 60000);
  });

export const signInWithGoogle = async ({ axios }) => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error(
      'Google sign-in needs VITE_GOOGLE_CLIENT_ID (and server GOOGLE_CLIENT_ID). Add your Web Client ID, then retry.'
    );
  }
  await loadGoogleScript();

  const credential = await requestGoogleCredential(clientId);

  // Access tokens from the popup fallback are verified server-side.
  if (typeof credential === 'object' && credential?.__accessToken) {
    const { data } = await axios.post('/api/user/google', {
      accessToken: credential.__accessToken,
    });
    if (!data?.success) throw new Error(data?.message || 'Google sign-in failed');
    return data.token;
  }

  return postSocialToken(axios, '/api/user/google', { idToken: credential });
};

export const signInWithApple = async ({ axios }) => {
  const clientId = import.meta.env.VITE_APPLE_CLIENT_ID;
  if (!clientId) {
    throw new Error(
      'Apple sign-in needs VITE_APPLE_CLIENT_ID (Services ID) and server APPLE_CLIENT_ID. Add them, then retry.'
    );
  }
  await loadAppleScript();
  window.AppleID.auth.init({
    clientId,
    scope: 'name email',
    redirectURI: `${window.location.origin}/login`,
    usePopup: true,
  });
  const resp = await window.AppleID.auth.signIn();
  const idToken = resp?.authorization?.id_token;
  if (!idToken) throw new Error('Apple did not return a credential');
  return postSocialToken(axios, '/api/user/apple', {
    idToken,
    user: resp?.user
      ? {
          email: resp.user.email,
          name: [resp.user.name?.firstName, resp.user.name?.lastName].filter(Boolean).join(' '),
        }
      : undefined,
  });
};
